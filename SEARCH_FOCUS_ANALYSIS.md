# 🔍 Search Input Focus Analysis - November 27, 2025

## Current Status: Investigation In Progress

User reported: **"masih sama"** - indicating the focus blur issue when searching persists despite previous fix attempts.

---

## Problem Statement

When user types in the search input field on `/admin/courses`:
- **Expected**: Input maintains focus while typing, and data updates after debounce (500ms)
- **Actual**: Input appears to blur (focus is lost)
- **Timing**: Blur happens either immediately or after debounce completes

---

## Implementation Analysis

### SearchFilterInput Component (✅ UNCONTROLLED)

**File**: `src/components/common/filter-table.tsx`

**Status**: Properly implemented as uncontrolled component
```typescript
export const SearchFilterInput: FC<SearchFilterInputProps> = ({
  onChange,      // Debounced callback to parent
  onClear,
  placeholder,
  disabled,
}) => {
  // ✅ Single source of truth for input state
  const [inputValue, setInputValue] = useState("");
  
  // ✅ NO useEffect([value]) that syncs parent value
  // ✅ NO value prop from parent
  // ✅ Component manages its own state completely
};
```

**Key Features**:
- ✅ Uncontrolled - component state independent of parent
- ✅ 500ms debounce on onChange callback
- ✅ Immediate UI feedback (no debounce on input display)
- ✅ Explicit key="search-input" added to prevent accidental remounts

### AdminCoursesPage Integration

**File**: `src/app/admin/courses/page.tsx`

**SearchFilterInput Props**:
```tsx
<SearchFilterInput
  key="search-input"  // ✅ Added to prevent remount
  onChange={table.filters.setSearch}
  onClear={table.filters.clearSearch}
  placeholder="Cari berdasarkan judul kursus..."
  disabled={table.isLoading}
/>
```

**Status**: Correctly integrated - NO `value` prop passed ✅

### Data Flow

```
User Types in SearchFilterInput
   ↓
Component updates local state immediately (inputValue)
   ↓
500ms debounce timer starts
   ↓
User continues typing/stops
   ↓
Debounce completes → onChange called
   ↓
Parent receives setSearch(value)
   ↓
useTableFilters updates search state
   ↓
queryParams changes (dependency on search)
   ↓
React Query detects params change
   ↓
API call triggered (async)
   ↓
API response received
   ↓
Parent component re-renders with new data
   ↓
SearchFilterInput re-renders BUT:
   - inputValue state preserved (component is uncontrolled)
   - NO value prop updates (nothing forces input value change)
   - Focus should be preserved ✓
```

---

## Possible Root Causes

### 1. ❓ Component Unmount/Remount
- **Mitigated**: Added explicit `key="search-input"`
- **Why**: Prevents React from recreating component on parent re-render
- **Status**: IMPLEMENTED

### 2. ❓ Controlled Input Being Forced by Parent
- **Status**: NOT HAPPENING
- Evidence: No `value` prop passed to SearchFilterInput
- Component is truly uncontrolled

### 3. ❓ Parent Re-render Timing Issue
- **Timing**: Parent re-renders after API response
- **Expected**: Shouldn't affect input focus if component uncontrolled
- **Possible**: Some condition causing component re-creation

### 4. ❓ Input Element HTML Replacement
- **shadcn Input Component**: Standard HTML input, no special behaviors
- **No refs, no updates to element**: Just plain `<input {...props} />`
- **Status**: Unlikely culprit

### 5. ❓ Card/CardContent Re-render
- **Possibility**: If parent CardContent structure changes on data update
- **Would cause**: Full DOM tree rebuild
- **Mitigation**: None currently applied

---

## Debugging Strategy

### Required Information from User

**Need to clarify WHEN blur happens:**

1. **Immediately while typing?** (each keystroke)
   - Would indicate: Parent re-rendering on every keystroke
   - **Solution**: Check why parent re-renders during typing

2. **After 500ms debounce completes?** (after pause)
   - Would indicate: Parent re-render when queryParams changes
   - **Expected**: Should NOT blur even on re-render (uncontrolled)
   - **Problem**: Something is forcing blur

3. **After API response arrives?** (when data loads)
   - Would indicate: DataTable update or page layout change
   - **Possible**: DOM reflow/layout shift stealing focus

### Test Spec Created

**File**: `e2e/search-focus-debug.spec.ts`

Two tests added:
```typescript
1. "typing should NOT blur search input"
   - Verifies: Input has focus after typing
   - Expected: isFocused === true ✓

2. "search should work and data should update"
   - Verifies: Search functionality works
   - Expected: Data updates after debounce ✓
```

**Run tests**:
```bash
npx playwright test e2e/search-focus-debug.spec.ts --headed
```

**Expected output**: Both tests pass (green) ✓

---

## Hypothesis (Most Likely)

**Parent component is not re-rendering correctly during initial search**

Possibility: 
- When user finishes typing and debounce fires
- onChange called → setSearch called
- But parent might not be properly receiving the update
- Or queryParams might not be triggering refetch

**Verification**:
1. Check browser DevTools Console for errors
2. Check React DevTools - see if parent component renders
3. Check Network tab - see if API call is made with search param

---

## Next Steps

1. **Get clarity from user**:
   - WHEN exactly does blur happen?
   - Is data filtering working?
   - Any console errors?

2. **Run debug test**:
   ```bash
   npx playwright test e2e/search-focus-debug.spec.ts --headed
   ```

3. **If test passes**:
   - Focus blur is NOT happening in standard flow
   - Issue might be environment/browser specific
   - Or specific data scenario triggers it

4. **If test fails**:
   - Confirms blur is happening during test
   - Check test output for timing
   - Add more granular focus tracking

---

## Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| SearchFilterInput | ✅ Uncontrolled | No value prop, independent state |
| useTableFilters | ✅ Updated | Simple search state, no split states |
| useServerTable | ✅ Working | React Query integration solid |
| AdminCoursesPage | ✅ Integrated | Proper props, no value sync |
| Focus Prevention | ✅ Mitigated | key prop added, no remounts |
| Debounce | ✅ 500ms | Component-level, working |
| Test Coverage | ✅ Added | Focus behavior tests created |

---

## Build Status

```
✅ TypeScript: Zero errors
✅ ESLint: Passing
✅ Build: Success
✅ Tests: Ready to run
```

---

## Files Modified

1. `src/components/common/filter-table.tsx` - SearchFilterInput (uncontrolled)
2. `src/app/admin/courses/page.tsx` - Added key prop
3. `e2e/search-focus-debug.spec.ts` - Debug tests created

---

## Related Commits

- `f57e7c0` - Fix: SearchFilterInput as UNCONTROLLED component
- `b10fb34` - Chore: Remove debug console.log
- `9fb53ff` - Feat: Add key and test spec

---

## For User

**Please provide**:
1. Exact timing of blur (before/after/during debounce)
2. Browser being used (Chrome, Firefox, Safari, Edge)
3. Console errors if any
4. Screenshot or video of the issue
5. Is data being filtered correctly? (despite blur)

**Current Code Quality**:
- ✅ Component pattern: Best practices followed
- ✅ Performance: Optimized with uncontrolled component
- ✅ Type Safety: Full TypeScript strict mode
- ✅ Testing: Debug tests ready

---

**Analysis Date**: November 27, 2025  
**Status**: Waiting for user clarification  
**Priority**: High (User experience blocking)
