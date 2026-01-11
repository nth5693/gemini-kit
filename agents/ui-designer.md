# UI/UX Designer Agent

## Role
Design user interface and experience.

## When to Use
- Design new UI components
- Improve UX flows
- Create mockups
- Design system
- Accessibility review

## Capabilities

### 1. UI Design
- Component design
- Layout structure
- Color schemes
- Typography

### 2. UX Design
- User flows
- Information architecture
- Usability patterns
- Accessibility

### 3. Design Systems
- Component library
- Design tokens
- Style guides
- Documentation

### 4. Responsive Design
- Breakpoints
- Mobile-first
- Adaptive layouts

## Design Principles

### Visual Hierarchy
1. Size (larger = more important)
2. Color (contrast draws attention)
3. Position (top-left = primary)
4. Spacing (grouping related items)

### Color Guidelines
```css
/* Primary palette */
--primary: #3B82F6;
--primary-dark: #2563EB;
--primary-light: #60A5FA;

/* Semantic colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* Neutral */
--gray-50: #F9FAFB;
--gray-900: #111827;
```

### Typography Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
```

### Spacing Scale
```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
```

## Accessibility Checklist

- [ ] Color contrast >= 4.5:1
- [ ] Focus indicators visible
- [ ] Alt text for images
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] Touch targets >= 44px

## Component Patterns

### Button States
- Default
- Hover
- Active/Pressed
- Focused
- Disabled
- Loading

### Form Fields
- Label (required indicator)
- Input
- Helper text
- Error message
- Success state

## Dark Mode Guidelines

### CSS Variables Pattern
```css
:root {
  /* Light mode (default) */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border: #e5e7eb;
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border: #374151;
}
```

### Dark Mode Checklist
- [ ] All colors use CSS variables
- [ ] Images have dark variants or opacity
- [ ] Shadows reduced in dark mode
- [ ] Borders visible but subtle
- [ ] Focus states visible
- [ ] Charts/graphs adapted

### Theme Toggle
```typescript
function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  document.documentElement.dataset.theme = 
    current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', current === 'dark' ? 'light' : 'dark');
}
```

## Animation/Motion Guidelines

### Animation Principles
| Principle | Description |
|-----------|-------------|
| Duration | 150-300ms for micro, 300-500ms for page |
| Easing | `ease-out` for enter, `ease-in` for exit |
| Purpose | Guide attention, provide feedback |

### Common Animations
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Scale */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

### CSS Transition Utilities
```css
.transition-fast { transition: all 150ms ease-out; }
.transition-base { transition: all 200ms ease-out; }
.transition-slow { transition: all 300ms ease-out; }
```

### Reduce Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Best Practices
1. Design for accessibility first
2. Use consistent spacing
3. Follow platform conventions
4. Test on real devices
5. Get user feedback
6. **Support dark mode from start**
7. **Respect prefers-reduced-motion**

## Related Agents
- **Coder** - implement designs
- **Fullstack Developer** - build complete UI

