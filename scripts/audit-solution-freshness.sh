#!/bin/bash
# audit-solution-freshness.sh
# Check solution documentation for freshness and validity
# Usage: ./scripts/audit-solution-freshness.sh [--fix]

SOLUTIONS_DIR="docs/solutions"
METRICS_FILE=".agent/metrics/compound_history.json"
CURRENT_DATE=$(date +%Y-%m-%d)
EXIT_CODE=0

echo "🔍 Auditing Solution Freshness..."

# 1. Check for Orphaned Solutions (Never Referenced)
# A solution is orphaned if it has 0 references in its quality metadata OR if not tracked.
# Since we just added referenced_count/last_referenced, many valid docs may be "orphans" statistically.
# We will define an orphan as: Created > 7 days ago AND last_referenced is null/empty.

ORPHAN_COUNT=0
STALE_COUNT=0
BROKEN_LINK_COUNT=0

# Ensure we have a way to check creation time (stat logic varies by OS)
get_creation_date() {
    # limit to YYYY-MM-DD
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f "%SB" -t "%Y-%m-%d" "$1"
    else
        date -r "$1" +%Y-%m-%d 2>/dev/null || echo "$CURRENT_DATE" 
    fi
}

# Iterate all solution files
while IFS= read -r file; do
    # Skip non-markdown, schema, README, and template files
    if [[ "$file" == *"schema.yaml" ]]; then continue; fi
    if [[ "$file" == *"README.md" ]]; then continue; fi
    if [[ "$file" == *"template"* ]]; then continue; fi
    if [[ "$file" == *"/templates/"* ]]; then continue; fi
    
    # Get Frontmatter Data (using simple grep for speed/portability)
    LAST_REF=$(grep "^  last_referenced:" "$file" | awk '{print $2}' | tr -d '"')
    DATE_CREATED=$(grep "^  date:" "$file" | awk '{print $2}' | tr -d '"')
    
    # Fallback if date field missing
    if [ -z "$DATE_CREATED" ]; then
        DATE_CREATED=$(get_creation_date "$file")
    fi
    
    # Calculate Age
    # Basic date comparison in bash is painful, use seconds since epoch
    NOW_SEC=$(date +%s)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        CREATED_SEC=$(date -j -f "%Y-%m-%d" "$DATE_CREATED" +%s 2>/dev/null)
        [ -z "$CREATED_SEC" ] && CREATED_SEC=$NOW_SEC
        
        if [ ! -z "$LAST_REF" ] && [ "$LAST_REF" != "null" ]; then
           LAST_REF_SEC=$(date -j -f "%Y-%m-%d" "$LAST_REF" +%s 2>/dev/null)
        else
           LAST_REF_SEC=0
        fi
    else
        # GNU date
        CREATED_SEC=$(date -d "$DATE_CREATED" +%s 2>/dev/null)
        [ -z "$CREATED_SEC" ] && CREATED_SEC=$NOW_SEC

        if [ ! -z "$LAST_REF" ] && [ "$LAST_REF" != "null" ]; then
           LAST_REF_SEC=$(date -d "$LAST_REF" +%s 2>/dev/null)
        else
           LAST_REF_SEC=0
        fi
    fi
    
    AGE_DAYS=$(( (NOW_SEC - CREATED_SEC) / 86400 ))
    
    # Check 1: Orphan (Old but never referenced)
    if [ "$AGE_DAYS" -gt 7 ] && [ "$LAST_REF_SEC" -eq 0 ]; then
        ORPHAN_COUNT=$((ORPHAN_COUNT + 1))
        # echo "  ⚠️  Orphan: $file (Created $AGE_DAYS days ago, never referenced)"
    fi
    
    # Check 2: Stale (Last referenced > 60 days ago)
    if [ "$LAST_REF_SEC" -gt 0 ]; then
        REF_AGE_DAYS=$(( (NOW_SEC - LAST_REF_SEC) / 86400 ))
        if [ "$REF_AGE_DAYS" -gt 60 ]; then
             STALE_COUNT=$((STALE_COUNT + 1))
             echo "  🕰️  Stale: $file (Last used $REF_AGE_DAYS days ago)"
        fi
    fi

    # Check 3: Broken Relative Links and Anchors
    # Extract all markdown links: [label](path/to/file.md#anchor)
    # We skip links inside fenced code blocks to avoid false positives from examples
    # Using sed to remove code blocks and then process links
    
    # Create a temporary version of the file without fenced code blocks
    CLEAN_CONTENT=$(sed '/^```/,/^```/d' "$file")
    
    while read -r line_info; do
        line_num=$(echo "$line_info" | cut -d: -f1)
        line_content=$(echo "$line_info" | cut -d: -f2-)
        
        # Extract each link on the line and check them
        while read -r raw_markdown_link; do
            [ -z "$raw_markdown_link" ] && continue
            
            # Extract the path part: remove [label]( and the trailing )
            link=$(echo "$raw_markdown_link" | sed 's/.*](\(.*\))/\1/')
            
            # Handle relative paths: remove anchor #..., resolve ./ or ../
            file_part=$(echo "$link" | cut -d'#' -f1)
            anchor_part=$(echo "$link" | cut -d'#' -f2 -s)
            
            # Determine directory of current file
            DIR=$(dirname "$file")
            
            # Resolve target file path
            TARGET_FILE=""
            if [[ "$file_part" == /* ]]; then
                TARGET_FILE=".$file_part" # Assume root if starts with /
            elif [ -f "$DIR/$file_part" ]; then
                TARGET_FILE="$DIR/$file_part"
            elif [ -f "$file_part" ]; then
                TARGET_FILE="$file_part"
            fi

            if [ -z "$TARGET_FILE" ] || [ ! -f "$TARGET_FILE" ]; then
                BROKEN_LINK_COUNT=$((BROKEN_LINK_COUNT + 1))
                echo "  ❌ Broken Link in $file:$line_num -> $link (File not found)"
                EXIT_CODE=1
            elif [ ! -z "$anchor_part" ]; then
                # Anchor verification
                
                # Special case: line numbers (L123) are not headers
                if [[ "$anchor_part" =~ ^L[0-9]+ ]]; then
                    continue
                fi

                # Normalize anchor: replace hyphens with optional non-alphanumeric gap
                SEARCH_REGEX=$(echo "$anchor_part" | sed 's/-/.*[[:punct:]]*.*/g')
                
                # Check if any header matches (case insensitive)
                if ! grep -qi "^#\{1,6\}.*$SEARCH_REGEX" "$TARGET_FILE"; then
                    # Fallback: exact substring check of sanitized strings
                    BROKEN_ANCHOR=1
                    while read -r header; do
                        header_san=$(echo "$header" | tr -cd '[:alnum:]' | tr '[:upper:]' '[:lower:]')
                        anchor_san=$(echo "$anchor_part" | tr -cd '[:alnum:]' | tr '[:upper:]' '[:lower:]')
                        if [[ "$header_san" == *"$anchor_san"* ]]; then
                            BROKEN_ANCHOR=0
                            break
                        fi
                    done < <(grep "^#\{1,6\}" "$TARGET_FILE")
                    
                    if [ "$BROKEN_ANCHOR" -eq 1 ]; then
                        BROKEN_LINK_COUNT=$((BROKEN_LINK_COUNT + 1))
                        echo "  ⚠️  Broken Anchor in $file:$line_num -> $link (Header not found in $TARGET_FILE)"
                        EXIT_CODE=1
                    fi
                fi
            fi
        done < <(echo "$line_content" | grep -o '\[[^]]*\]([^)]*\.md[^)]*)')
    done < <(echo "$CLEAN_CONTENT" | grep -n '\[[^]]*\]([^)]*\.md[^)]*)')

done < <(find "$SOLUTIONS_DIR" -name "*.md" -type f)

# Output Summary
if [ "$ORPHAN_COUNT" -gt 0 ]; then
    echo "⚠️  Found $ORPHAN_COUNT orphaned solutions (Created >7d ago, never referenced)."
    # Only fail if it's extreme, or just warn for now.
    # EXIT_CODE=1 
fi

if [ "$STALE_COUNT" -gt 0 ]; then
    echo "⚠️  Found $STALE_COUNT stale solutions (Not referenced in >60 days)."
fi

if [ "$BROKEN_LINK_COUNT" -gt 0 ]; then
    echo "❌ Found $BROKEN_LINK_COUNT broken relative links."
    EXIT_CODE=1
fi

if [ "$EXIT_CODE" -eq 0 ]; then
    echo "✅ Solution freshness audit passed."
else
    echo "❌ Solution freshness audit failed."
fi

exit $EXIT_CODE
