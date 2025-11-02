package progress

import (
	"context"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repository interface {
	MarkLessonComplete(ctx context.Context, userID, lessonID, courseID uint) (*LessonProgress, error)
	GetLessonProgress(ctx context.Context, userID, lessonID uint) (*LessonProgress, error)
	GetCourseProgress(ctx context.Context, userID, courseID uint) ([]*LessonProgress, error)
	GetUserProgress(ctx context.Context, userID uint) ([]*LessonProgress, error)
	IsLessonCompleted(ctx context.Context, userID, lessonID uint) (bool, error)
	GetCourseCompletionCount(ctx context.Context, userID, courseID uint) (int64, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// MarkLessonComplete marks a lesson as completed (idempotent)
func (r *repository) MarkLessonComplete(ctx context.Context, userID, lessonID, courseID uint) (*LessonProgress, error) {
	progress := &LessonProgress{
		UserID:      userID,
		LessonID:    lessonID,
		CourseID:    courseID,
		CompletedAt: time.Now(),
	}

	// Use ON CONFLICT to make it idempotent
	result := r.db.WithContext(ctx).
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "user_id"}, {Name: "lesson_id"}},
			DoUpdates: clause.AssignmentColumns([]string{"completed_at", "updated_at"}),
		}).
		Create(progress)

	if result.Error != nil {
		return nil, result.Error
	}

	return progress, nil
}

// GetLessonProgress gets progress for a specific lesson
func (r *repository) GetLessonProgress(ctx context.Context, userID, lessonID uint) (*LessonProgress, error) {
	var progress LessonProgress
	result := r.db.WithContext(ctx).
		Where("user_id = ? AND lesson_id = ?", userID, lessonID).
		First(&progress)

	if result.Error != nil {
		return nil, result.Error
	}

	return &progress, nil
}

// GetCourseProgress gets all progress for a course
func (r *repository) GetCourseProgress(ctx context.Context, userID, courseID uint) ([]*LessonProgress, error) {
	var progress []*LessonProgress
	result := r.db.WithContext(ctx).
		Where("user_id = ? AND course_id = ?", userID, courseID).
		Order("created_at ASC").
		Find(&progress)

	if result.Error != nil {
		return nil, result.Error
	}

	return progress, nil
}

// GetUserProgress gets all progress for a user across all courses
func (r *repository) GetUserProgress(ctx context.Context, userID uint) ([]*LessonProgress, error) {
	var progress []*LessonProgress
	result := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("completed_at DESC").
		Find(&progress)

	if result.Error != nil {
		return nil, result.Error
	}

	return progress, nil
}

// IsLessonCompleted checks if a lesson is completed
func (r *repository) IsLessonCompleted(ctx context.Context, userID, lessonID uint) (bool, error) {
	var count int64
	result := r.db.WithContext(ctx).
		Model(&LessonProgress{}).
		Where("user_id = ? AND lesson_id = ?", userID, lessonID).
		Count(&count)

	if result.Error != nil {
		return false, result.Error
	}

	return count > 0, nil
}

// GetCourseCompletionCount gets the number of completed lessons for a course
func (r *repository) GetCourseCompletionCount(ctx context.Context, userID, courseID uint) (int64, error) {
	var count int64
	result := r.db.WithContext(ctx).
		Model(&LessonProgress{}).
		Where("user_id = ? AND course_id = ?", userID, courseID).
		Count(&count)

	if result.Error != nil {
		return 0, result.Error
	}

	return count, nil
}
