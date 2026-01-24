#!/bin/bash
# scripts/compound-metrics.sh
# Collects daily metrics snapshot and appends to history.json
# Usage: ./scripts/compound-metrics.sh [force]
# DEPENDENCIES: Node.js (for JSON handling)
set -e

METRICS_DIR=".agent/metrics"
HISTORY_FILE="$METRICS_DIR/compound_history.json"
TODAY=$(date +%Y-%m-%d)
LOG_FILE=".agent/logs/metrics_debug.log"

# Create metrics directory if not exists
mkdir -p "$METRICS_DIR"

# Check if entry for today already exists (unless force is set)
if [ "$1" != "force" ] && [ -f "$HISTORY_FILE" ]; then
    if grep -q "\"date\": \"$TODAY\"" "$HISTORY_FILE"; then
        echo "Metrics for $TODAY already collected. Use 'force' to overwrite (not implemented yet, safe skip)."
        echo "Skipping collection."
        exit 0
    fi
fi

echo "Collecting metrics for $TODAY..."

# --- 1. Solution Metrics ---
SOL_COUNT=$(ls docs/solutions/**/*.md 2>/dev/null | wc -l | tr -d ' ')
REF_COUNT=$(grep -l "last_referenced: \"20" docs/solutions/**/*.md 2>/dev/null | wc -l | tr -d ' ')

if [ "$SOL_COUNT" -gt 0 ]; then
    HIT_RATE=$(( (REF_COUNT * 100) / SOL_COUNT ))
else
    HIT_RATE=0
fi

# Zombies (Ref < 90d ago)
CUTOFF=$(date -v-90d +%Y-%m-%d 2>/dev/null || date -d "90 days ago" +%Y-%m-%d)
ZOMBIE_COUNT=0
while read -r file; do
    # Skip README and template files
    [[ "$file" == *"README.md" ]] && continue
    [[ "$file" == *"template"* ]] && continue
    [[ "$file" == *"/templates/"* ]] && continue
    
    LAST_REF=$(grep "^last_referenced:" "$file" | cut -d'"' -f2 || echo "")
    if [[ "$LAST_REF" =~ ^20 ]] && [[ "$LAST_REF" < "$CUTOFF" ]]; then
        ZOMBIE_COUNT=$((ZOMBIE_COUNT + 1))
    fi
done < <(find docs/solutions -name "*.md")

# --- 2. Workflow & Skill Metrics ---
WORKFLOW_LOG=".agent/logs/workflow_usage.log"
SKILL_LOG=".agent/logs/skill_usage.log"

# Function to get top 3 items in JSON format using awk
get_top_json() {
    local file=$1
    if [ -f "$file" ]; then
         cut -d'|' -f2 "$file" | sort | uniq -c | sort -nr | head -3 | \
         awk '{printf "{\"name\": \"%s\", \"count\": %s},", $2, $1}' | \
         sed 's/,$//' # remove trailing comma
    fi
}

# Workflows
if [ -f "$WORKFLOW_LOG" ]; then
    WF_INVOCATIONS=$(wc -l < "$WORKFLOW_LOG" | tr -d ' ')
    WF_TOP_JSON="[$(get_top_json "$WORKFLOW_LOG")]"
else
    WF_INVOCATIONS=0
    WF_TOP_JSON="[]"
fi

# Detect Unused Workflows
ALL_WORKFLOWS=$(ls .agent/workflows/*.md 2>/dev/null | grep -v README | xargs -n1 basename | sed 's/.md$//' | sed 's/^/\//')
USED_WORKFLOWS=""
[ -f "$WORKFLOW_LOG" ] && USED_WORKFLOWS=$(cut -d'|' -f2 "$WORKFLOW_LOG" 2>/dev/null | sort -u)

WF_UNUSED_ARRAY=()
while IFS= read -r wf; do
    [ -z "$wf" ] && continue
    if ! echo "$USED_WORKFLOWS" | grep -qx "$wf"; then
        WF_UNUSED_ARRAY+=("$wf")
    fi
done <<< "$ALL_WORKFLOWS"
WF_UNUSED_COUNT=${#WF_UNUSED_ARRAY[@]}

# Convert array to JSON array string manually to avoid jq dependency
WF_UNUSED_JSON="["
for wf in "${WF_UNUSED_ARRAY[@]}"; do
    WF_UNUSED_JSON+="\"$wf\","
done
WF_UNUSED_JSON=$(echo "$WF_UNUSED_JSON" | sed 's/,$//')
WF_UNUSED_JSON+="]"

# Skills
if [ -f "$SKILL_LOG" ]; then
    SKILL_INVOCATIONS=$(wc -l < "$SKILL_LOG" | tr -d ' ')
    SKILL_TOP_JSON="[$(get_top_json "$SKILL_LOG")]"
else
    SKILL_INVOCATIONS=0
    SKILL_TOP_JSON="[]"
fi

# --- 3. Todo Metrics ---
TOTAL_TODO_SCORE=0
COUNT_TODO_SCORED=0
ACTIVE_TODOS=$(ls todos/*.md 2>/dev/null | grep -v template | wc -l | tr -d ' ')

for todo in todos/*.md; do
    [ -e "$todo" ] || continue
    [[ "$(basename "$todo")" == "todo-template.md" ]] && continue
    SCORE=$(./scripts/score-todo.sh "$todo" 2>/dev/null | cut -d'/' -f1)
    if [ -n "$SCORE" ]; then
        TOTAL_TODO_SCORE=$((TOTAL_TODO_SCORE + SCORE))
        COUNT_TODO_SCORED=$((COUNT_TODO_SCORED + 1))
    fi
done

if [ "$COUNT_TODO_SCORED" -gt 0 ]; then
    AVG_TODO_QUALITY=$((TOTAL_TODO_SCORE / COUNT_TODO_SCORED))
else
    AVG_TODO_QUALITY=0
fi

# --- 4. Plan/Spec Drift Detection ---
PLAN_DRIFT_COUNT=0
PLAN_DRIFT_CUTOFF=$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d "7 days ago" +%Y-%m-%d)

for plan in plans/*.md; do
    [ -e "$plan" ] || continue
    [[ "$(basename "$plan")" == "README.md" ]] && continue
    
    if grep -q "^> Status: Draft" "$plan" 2>/dev/null; then
        CREATED=$(grep "^> Created:" "$plan" | sed 's/^> Created: //' | tr -d ' ')
        if [[ "$CREATED" =~ ^20 ]] && [[ "$CREATED" < "$PLAN_DRIFT_CUTOFF" ]]; then
            PLAN_DRIFT_COUNT=$((PLAN_DRIFT_COUNT + 1))
        fi
    fi
done

# Spec Drift
SPEC_DRIFT_COUNT=0
SPEC_DRIFT_CUTOFF=$(date -v-14d +%Y-%m-%d 2>/dev/null || date -d "14 days ago" +%Y-%m-%d)

for spec_dir in docs/specs/*/; do
    [ -d "$spec_dir" ] || continue
    [[ "$(basename "$spec_dir")" == "templates" ]] && continue
    
    README="$spec_dir/README.md"
    [ -f "$README" ] || continue
    
    CURRENT_PHASE=$(grep "Current Phase:" "$README" | sed 's/.*Phase //' | cut -d' ' -f1)
    PROGRESS=$(grep "Progress:" "$README" | grep -oE '[0-9]+%' | tr -d '%')
    
    if [ -n "$PROGRESS" ] && [ "$PROGRESS" -lt 100 ]; then
        LAST_MOD=$(stat -f "%Sm" -t "%Y-%m-%d" "$README" 2>/dev/null || stat -c "%y" "$README" | cut -d' ' -f1)
        if [[ "$LAST_MOD" =~ ^20 ]] && [[ "$LAST_MOD" < "$SPEC_DRIFT_CUTOFF" ]]; then
            SPEC_DRIFT_COUNT=$((SPEC_DRIFT_COUNT + 1))
        fi
    fi
done

# --- 5. Exploration Metrics ---
EXPLORATION_COUNT=$(ls docs/explorations/*.md 2>/dev/null | grep -v template | grep -v schema | wc -l | tr -d ' ')

# --- 6. Health Grade Calculation ---
TOTAL_DRIFT=$((PLAN_DRIFT_COUNT + SPEC_DRIFT_COUNT))
GRADE="F"
if [ "$HIT_RATE" -gt 60 ] && [ "$AVG_TODO_QUALITY" -gt 7 ] && [ "$TOTAL_DRIFT" -lt 2 ]; then GRADE="A"
elif [ "$HIT_RATE" -gt 45 ] && [ "$AVG_TODO_QUALITY" -gt 5 ] && [ "$TOTAL_DRIFT" -lt 5 ]; then GRADE="B"
elif [ "$HIT_RATE" -gt 30 ] && [ "$AVG_TODO_QUALITY" -gt 4 ] && [ "$TOTAL_DRIFT" -lt 10 ]; then GRADE="C"
elif [ "$HIT_RATE" -gt 15 ] && [ "$TOTAL_DRIFT" -lt 15 ]; then GRADE="D"
fi

# --- 6. Construct JSON Entry & Append (Using Node.js) ---
# We use Node.js to safely parse the existing history, append the new entry, and write it back.
# This avoids 'jq' dependency while ensuring valid JSON.

export HISTORY_FILE
export TODAY
export SOL_COUNT
export HIT_RATE
export ZOMBIE_COUNT
export WF_INVOCATIONS
export WF_TOP_JSON
export WF_UNUSED_COUNT
export WF_UNUSED_JSON
export SKILL_INVOCATIONS
export SKILL_TOP_JSON
export ACTIVE_TODOS
export AVG_TODO_QUALITY
export PLAN_DRIFT_COUNT
export SPEC_DRIFT_COUNT
export EXPLORATION_COUNT
export GRADE

node -e '
const fs = require("fs");
const historyFile = process.env.HISTORY_FILE;

// Construct the new entry object
const newEntry = {
    date: process.env.TODAY,
    solutions: {
        total: parseInt(process.env.SOL_COUNT) || 0,
        hit_rate: parseInt(process.env.HIT_RATE) || 0,
        zombies: parseInt(process.env.ZOMBIE_COUNT) || 0
    },
    workflows: {
        invocations: parseInt(process.env.WF_INVOCATIONS) || 0,
        top: JSON.parse(process.env.WF_TOP_JSON || "[]"),
        unused_count: parseInt(process.env.WF_UNUSED_COUNT) || 0,
        unused: JSON.parse(process.env.WF_UNUSED_JSON || "[]")
    },
    skills: {
        invocations: parseInt(process.env.SKILL_INVOCATIONS) || 0,
        top: JSON.parse(process.env.SKILL_TOP_JSON || "[]")
    },
    todos: {
        active: parseInt(process.env.ACTIVE_TODOS) || 0,
        avg_quality: parseInt(process.env.AVG_TODO_QUALITY) || 0
    },
    drift: {
        plan_drift: parseInt(process.env.PLAN_DRIFT_COUNT) || 0,
        spec_drift: parseInt(process.env.SPEC_DRIFT_COUNT) || 0
    },
    explorations: {
        count: parseInt(process.env.EXPLORATION_COUNT) || 0
    },
    health_grade: process.env.GRADE
};

// Read existing history
let history = [];
if (fs.existsSync(historyFile)) {
    try {
        const content = fs.readFileSync(historyFile, "utf8");
        history = JSON.parse(content || "[]");
        if (!Array.isArray(history)) history = [];
    } catch (e) {
        console.error("Error parsing history file:", e.message);
        console.log("Creating new backup history...");
        if (fs.existsSync(historyFile)) {
             fs.copyFileSync(historyFile, historyFile + ".corrupt.bak");
        }
        history = [];
    }
}

// Check if entry for date exists again (double check) for safety
const force = process.argv[1] === "force";
if (force) {
    history = history.filter(entry => entry.date !== newEntry.date);
} else if (history.some(entry => entry.date === newEntry.date)) {
    console.log("Entry for " + newEntry.date + " already exists. Use 'force' to overwrite.");
    process.exit(0);
}

history.push(newEntry);

// Prune old history (Keep 90 days)
const RETENTION_DAYS = 90;
const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
const cutoffStr = cutoff.toISOString().split("T")[0];

const originalCount = history.length;
history = history.filter(entry => entry.date >= cutoffStr);
const prunedCount = originalCount - history.length;

if (prunedCount > 0) {
    console.log(`Pruned ${prunedCount} entries older than ${cutoffStr}`);
    // Create backup before writing back
    try {
        fs.copyFileSync(historyFile, historyFile + ".bak");
    } catch (e) {
        console.warn("Pruning backup failed, proceeding anyway:", e.message);
    }
}

// Write back atomically-ish
try {
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    console.log("Metrics appended successfully to " + historyFile);
} catch (e) {
    console.error("Failed to write history file:", e.message);
    process.exit(1);
}
' "$1"

if [ $? -eq 0 ]; then
    echo "Metrics collection complete. Grade: $GRADE"
else
    echo "Error writing metrics JSON."
    exit 1
fi
