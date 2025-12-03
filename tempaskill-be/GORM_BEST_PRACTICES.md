# GORM Best Practices - TempaSKill Backend

## ⚠️ Critical: Zero Value Behavior

### Problem

GORM's `Updates()` **skips zero values by default** to prevent accidental overwrites.

**Zero values** in Go:

- `false` (bool)
- `0` (int, uint, float)
- `""` (string)
- `nil` (pointer, slice, map)

### Example Bug

```go
// ❌ WRONG - boolean false will NOT be saved!
lesson.IsPublished = false
db.Model(&lesson).Updates(lesson) // is_published stays true in DB!

// ✅ CORRECT - forces update of all fields
db.Model(&lesson).Select("*").Updates(lesson) // is_published becomes false
```

### Real Bug We Had

**Scenario**: User clicks "Unpublish" on a lesson

```go
// Service layer
lesson.IsPublished = false // Set to false

// Repository layer (BEFORE fix)
db.Updates(lesson) // ❌ GORM skips is_published because false is zero value!

// Database
// is_published stays TRUE! Bug!
```

**Impact**:

- Frontend shows "Draft" (optimistic update)
- Backend responds with `is_published: false`
- Database still has `is_published: true`
- Refresh page → lesson is published again ❌

**Fix**:

```go
// Use Select("*") to force update ALL fields
db.Model(lesson).Select("*").Updates(lesson) // ✅ Now false is saved
```

---

## Solutions for Zero Values

### Option 1: Select("\*") - Update All Fields

**Use when**: Updating entire struct with all fields set

```go
func (r *repository) UpdateLesson(ctx context.Context, lesson *Lesson) error {
    return r.db.WithContext(ctx).
        Model(lesson).
        Select("*").           // Force update ALL fields
        Updates(lesson).Error
}
```

**Pros**:

- Simple, one line
- Updates all fields including zero values
- Good for full updates

**Cons**:

- Updates all columns (including timestamps if not using gorm.Model)
- Can't do partial updates easily

### Option 2: Select Specific Fields

**Use when**: Only updating certain fields

```go
func (r *repository) UpdateLessonStatus(ctx context.Context, id uint, isPublished bool) error {
    return r.db.WithContext(ctx).
        Model(&Lesson{}).
        Where("id = ?", id).
        Select("is_published", "updated_at").  // Explicit fields
        Updates(map[string]interface{}{
            "is_published": isPublished,
            "updated_at":   time.Now(),
        }).Error
}
```

**Pros**:

- Explicit about what's updated
- Safe for partial updates
- Clear intent

**Cons**:

- More verbose
- Need to maintain field list

### Option 3: Use Map for Partial Updates

**Use when**: Dynamic partial updates with zero values

```go
func (r *repository) PartialUpdate(ctx context.Context, id uint, updates map[string]interface{}) error {
    return r.db.WithContext(ctx).
        Model(&Lesson{}).
        Where("id = ?", id).
        Updates(updates).Error  // Map updates ALL provided values
}

// Usage
updates := map[string]interface{}{
    "is_published": false,  // Will be updated even though false
    "duration":     0,       // Will be updated even though 0
}
```

**Pros**:

- Flexible
- Zero values are respected in maps
- Good for API updates

**Cons**:

- Loses type safety
- Can't use struct validation

### Option 4: UpdateColumn (Skip Hooks)

**Use when**: Need to update zero values WITHOUT triggering hooks/timestamps

```go
db.Model(&lesson).UpdateColumn("is_published", false)
```

**⚠️ WARNING**: Skips:

- Hooks (BeforeUpdate, AfterUpdate)
- updated_at timestamp
- Validations

---

## Our Standard Pattern

### For Full Struct Updates (Lessons, Courses, etc.)

```go
// ✅ USE THIS for updating complete entities
func (r *repository) UpdateLesson(ctx context.Context, lesson *Lesson) error {
    return r.db.WithContext(ctx).
        Model(lesson).
        Select("*").  // ALWAYS use Select("*") for struct updates
        Updates(lesson).Error
}
```

### For Partial Updates from API

```go
// DTO with pointers (allows nil vs zero value distinction)
type UpdateLessonRequest struct {
    Title       *string `json:"title"`
    IsPublished *bool   `json:"is_published"`  // nil = don't update, false = set to false
}

// Service layer (set values on entity)
if req.Title != nil {
    lesson.Title = *req.Title
}
if req.IsPublished != nil {
    lesson.IsPublished = *req.IsPublished  // Can be true or false
}

// Repository (update with Select)
r.db.Model(lesson).Select("*").Updates(lesson)
```

---

## Checklist for New Update Operations

When adding any `Update` method:

- [ ] Does it update boolean fields? → Use `Select("*")`
- [ ] Does it update int/uint fields that can be 0? → Use `Select("*")`
- [ ] Is it a partial update? → Use pointers in DTO + Select specific fields OR map
- [ ] Are you using struct? → MUST use `Select()` if zero values are valid
- [ ] Are you using map? → Zero values are already respected, no Select needed
- [ ] Do you need hooks/timestamps? → Use `Updates()`, not `UpdateColumn()`

---

## Common Patterns in Our Codebase

### ✅ GOOD Examples

```go
// Lesson updates
db.Model(lesson).Select("*").Updates(lesson)

// Course updates
db.Model(course).Select("*").Updates(course)

// Map-based updates (zero values respected)
db.Model(&User{}).Where("id = ?", id).Updates(map[string]interface{}{
    "active": false,
})

// Specific field update
db.Model(&Course{}).Where("id = ?", id).Update("is_published", false)
```

### ❌ BAD Examples (Will Cause Bugs!)

```go
// ❌ Skips zero values - boolean false not saved
db.Model(lesson).Updates(lesson)

// ❌ Can't distinguish nil from false
db.Model(&User{}).Updates(User{Active: false})  // Active always false, even if not intended

// ❌ Loses is_published = false
db.Updates(&Course{
    ID: 1,
    Title: "New Title",
    IsPublished: false,  // SKIPPED!
})
```

---

## Testing Zero Value Updates

Always test edge cases:

```go
func TestUpdateLessonUnpublish(t *testing.T) {
    // Setup
    lesson := &Lesson{Title: "Test", IsPublished: true}
    db.Create(lesson)

    // Update to false
    lesson.IsPublished = false
    err := repo.UpdateLesson(ctx, lesson)

    // Verify it's actually false in DB
    var updated Lesson
    db.First(&updated, lesson.ID)

    assert.NoError(t, err)
    assert.False(t, updated.IsPublished)  // Must be false, not true!
}
```

---

## Related Issues

- Issue #XX: Unpublish lesson not persisting (fixed with Select("\*"))
- Commit: 836665b - Add Select("\*") to UpdateLesson

---

## References

- [GORM Updates Documentation](https://gorm.io/docs/update.html#Updates-multiple-columns)
- [GORM Select Documentation](https://gorm.io/docs/update.html#Update-Selected-Fields)
- [Go Zero Values](https://go.dev/tour/basics/12)

---

**Last Updated**: December 4, 2025  
**Maintained by**: Backend Team
