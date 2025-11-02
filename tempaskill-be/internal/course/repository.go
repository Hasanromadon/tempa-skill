package course

import (
	"context"
	"strings"

	"gorm.io/gorm"
)

type Repository interface {
	// Course operations
	CreateCourse(ctx context.Context, course *Course) error
	FindCourseByID(ctx context.Context, id uint) (*Course, error)
	FindCourseBySlug(ctx context.Context, slug string) (*Course, error)
	FindAllCourses(ctx context.Context, query *CourseListQuery) ([]*Course, int, error)
	UpdateCourse(ctx context.Context, course *Course) error
	DeleteCourse(ctx context.Context, id uint) error
	IncrementEnrolledCount(ctx context.Context, courseID uint) error
	DecrementEnrolledCount(ctx context.Context, courseID uint) error

	// Lesson operations
	CreateLesson(ctx context.Context, lesson *Lesson) error
	FindLessonByID(ctx context.Context, id uint) (*Lesson, error)
	FindLessonsByCourseID(ctx context.Context, courseID uint) ([]*Lesson, error)
	UpdateLesson(ctx context.Context, lesson *Lesson) error
	DeleteLesson(ctx context.Context, id uint) error
	CountLessonsByCourseID(ctx context.Context, courseID uint) (int, error)

	// Enrollment operations
	CreateEnrollment(ctx context.Context, enrollment *Enrollment) error
	FindEnrollment(ctx context.Context, userID, courseID uint) (*Enrollment, error)
	DeleteEnrollment(ctx context.Context, userID, courseID uint) error
	IsUserEnrolled(ctx context.Context, userID, courseID uint) (bool, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// Course operations

func (r *repository) CreateCourse(ctx context.Context, course *Course) error {
	return r.db.WithContext(ctx).Create(course).Error
}

func (r *repository) FindCourseByID(ctx context.Context, id uint) (*Course, error) {
	var course Course
	if err := r.db.WithContext(ctx).Preload("Lessons", func(db *gorm.DB) *gorm.DB {
		return db.Where("is_published = ?", true).Order("order_index ASC")
	}).First(&course, id).Error; err != nil {
		return nil, err
	}
	return &course, nil
}

func (r *repository) FindCourseBySlug(ctx context.Context, slug string) (*Course, error) {
	var course Course
	if err := r.db.WithContext(ctx).Preload("Lessons", func(db *gorm.DB) *gorm.DB {
		return db.Where("is_published = ?", true).Order("order_index ASC")
	}).Where("slug = ?", slug).First(&course).Error; err != nil {
		return nil, err
	}
	return &course, nil
}

func (r *repository) FindAllCourses(ctx context.Context, query *CourseListQuery) ([]*Course, int, error) {
	var courses []*Course
	var total int64

	db := r.db.WithContext(ctx).Model(&Course{})

	// Apply filters
	if query.Search != "" {
		searchTerm := "%" + strings.ToLower(query.Search) + "%"
		db = db.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", searchTerm, searchTerm)
	}

	if query.Category != "" {
		db = db.Where("category = ?", query.Category)
	}

	if query.Difficulty != "" {
		db = db.Where("difficulty = ?", query.Difficulty)
	}

	if query.Published != nil {
		db = db.Where("is_published = ?", *query.Published)
	}

	// Count total
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	page := query.Page
	if page < 1 {
		page = 1
	}
	limit := query.Limit
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	// Fetch courses
	if err := db.Order("created_at DESC").Limit(limit).Offset(offset).Find(&courses).Error; err != nil {
		return nil, 0, err
	}

	return courses, int(total), nil
}

func (r *repository) UpdateCourse(ctx context.Context, course *Course) error {
	return r.db.WithContext(ctx).Model(course).Updates(course).Error
}

func (r *repository) DeleteCourse(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&Course{}, id).Error
}

func (r *repository) IncrementEnrolledCount(ctx context.Context, courseID uint) error {
	return r.db.WithContext(ctx).Model(&Course{}).Where("id = ?", courseID).
		UpdateColumn("enrolled_count", gorm.Expr("enrolled_count + ?", 1)).Error
}

func (r *repository) DecrementEnrolledCount(ctx context.Context, courseID uint) error {
	return r.db.WithContext(ctx).Model(&Course{}).Where("id = ?", courseID).
		UpdateColumn("enrolled_count", gorm.Expr("enrolled_count - ?", 1)).Error
}

// Lesson operations

func (r *repository) CreateLesson(ctx context.Context, lesson *Lesson) error {
	return r.db.WithContext(ctx).Create(lesson).Error
}

func (r *repository) FindLessonByID(ctx context.Context, id uint) (*Lesson, error) {
	var lesson Lesson
	if err := r.db.WithContext(ctx).First(&lesson, id).Error; err != nil {
		return nil, err
	}
	return &lesson, nil
}

func (r *repository) FindLessonsByCourseID(ctx context.Context, courseID uint) ([]*Lesson, error) {
	var lessons []*Lesson
	if err := r.db.WithContext(ctx).Where("course_id = ?", courseID).
		Order("order_index ASC").Find(&lessons).Error; err != nil {
		return nil, err
	}
	return lessons, nil
}

func (r *repository) UpdateLesson(ctx context.Context, lesson *Lesson) error {
	return r.db.WithContext(ctx).Model(lesson).Updates(lesson).Error
}

func (r *repository) DeleteLesson(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&Lesson{}, id).Error
}

func (r *repository) CountLessonsByCourseID(ctx context.Context, courseID uint) (int, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&Lesson{}).
		Where("course_id = ? AND is_published = ?", courseID, true).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}

// Enrollment operations

func (r *repository) CreateEnrollment(ctx context.Context, enrollment *Enrollment) error {
	return r.db.WithContext(ctx).Create(enrollment).Error
}

func (r *repository) FindEnrollment(ctx context.Context, userID, courseID uint) (*Enrollment, error) {
	var enrollment Enrollment
	if err := r.db.WithContext(ctx).Where("user_id = ? AND course_id = ?", userID, courseID).
		First(&enrollment).Error; err != nil {
		return nil, err
	}
	return &enrollment, nil
}

func (r *repository) DeleteEnrollment(ctx context.Context, userID, courseID uint) error {
	return r.db.WithContext(ctx).Where("user_id = ? AND course_id = ?", userID, courseID).
		Delete(&Enrollment{}).Error
}

func (r *repository) IsUserEnrolled(ctx context.Context, userID, courseID uint) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&Enrollment{}).
		Where("user_id = ? AND course_id = ?", userID, courseID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
