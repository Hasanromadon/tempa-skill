package course

import (
	"context"
	"errors"
	"strings"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/logger"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repository interface {
	// Course operations
	CreateCourse(ctx context.Context, course *Course) error
	FindCourseByID(ctx context.Context, id uint) (*Course, error)
	FindCourseBySlug(ctx context.Context, slug string) (*Course, error)
	FindAllCourses(ctx context.Context, query *CourseListQuery) ([]*Course, int, error)
	FindAllCoursesWithMeta(ctx context.Context, userID uint, query *CourseListQuery) ([]*CourseWithMeta, int, error)
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
	BatchUpdateLessonOrder(ctx context.Context, updates []LessonOrderUpdate) error

	// Enrollment operations
	CreateEnrollment(ctx context.Context, enrollment *Enrollment) error
	FindEnrollment(ctx context.Context, userID, courseID uint) (*Enrollment, error)
	DeleteEnrollment(ctx context.Context, userID, courseID uint) error
	IsUserEnrolled(ctx context.Context, userID, courseID uint) (bool, error)
	GetUserEnrollments(ctx context.Context, userID uint) ([]*Enrollment, error) // New method
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// Course operations

func (r *repository) CreateCourse(ctx context.Context, course *Course) error {
	err := r.db.WithContext(ctx).Create(course).Error
	if err != nil {
		logger.Error("Failed to create course in database",
			zap.Error(err),
			zap.String("title", course.Title),
			zap.String("slug", course.Slug),
		)
		return err
	}
	return nil
}

func (r *repository) FindCourseByID(ctx context.Context, id uint) (*Course, error) {
	var course Course
	if err := r.db.WithContext(ctx).Preload("Lessons", func(db *gorm.DB) *gorm.DB {
		return db.Where("is_published = ?", true).Order("order_index ASC")
	}).First(&course, id).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Error("Database error finding course by ID",
				zap.Error(err),
				zap.Uint("course_id", id),
			)
		}
		return nil, err
	}
	return &course, nil
}

func (r *repository) FindCourseBySlug(ctx context.Context, slug string) (*Course, error) {
	var course Course
	if err := r.db.WithContext(ctx).Preload("Lessons", func(db *gorm.DB) *gorm.DB {
		return db.Where("is_published = ?", true).Order("order_index ASC")
	}).Where("slug = ?", slug).First(&course).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Error("Database error finding course by slug",
				zap.Error(err),
				zap.String("slug", slug),
			)
		}
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
		logger.Error("Database error counting courses",
			zap.Error(err),
			zap.String("search", query.Search),
			zap.String("category", query.Category),
		)
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
		logger.Error("Database error fetching courses",
			zap.Error(err),
			zap.Int("limit", limit),
			zap.Int("offset", offset),
		)
		return nil, 0, err
	}

	return courses, int(total), nil
}

// FindAllCoursesWithMeta optimized version that fetches courses with metadata in 1-2 queries
// Solves N+1 query problem by using JOINs and subqueries
func (r *repository) FindAllCoursesWithMeta(ctx context.Context, userID uint, query *CourseListQuery) ([]*CourseWithMeta, int, error) {
	var coursesWithMeta []*CourseWithMeta
	var total int64

	db := r.db.WithContext(ctx).Model(&Course{})

	// Apply filters (same as FindAllCourses)
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

	// Add new filters to count query
	if query.MinPrice > 0 {
		db = db.Where("price >= ?", query.MinPrice)
	}

	if query.MaxPrice > 0 {
		db = db.Where("price <= ?", query.MaxPrice)
	}

	if query.InstructorID > 0 {
		db = db.Where("instructor_id = ?", query.InstructorID)
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

	// Build optimized query with LEFT JOINs
	// This reduces N+1 queries to just 1 query
	// Build SELECT clause based on whether user is logged in
	selectClause := `
		courses.*,
		COALESCE(lesson_counts.count, 0) as lesson_count`
	
	if userID > 0 {
		selectClause += `,
		CASE WHEN enrollments.id IS NOT NULL THEN 1 ELSE 0 END as is_enrolled`
	} else {
		selectClause += `,
		0 as is_enrolled`
	}
	
	db = r.db.WithContext(ctx).
		Table("courses").
		Select(selectClause).
		Joins(`
			LEFT JOIN (
				SELECT course_id, COUNT(*) as count 
				FROM lessons 
				WHERE deleted_at IS NULL 
				GROUP BY course_id
			) AS lesson_counts ON lesson_counts.course_id = courses.id
		`)

	// Only join enrollments if user is logged in
	if userID > 0 {
		db = db.Joins(`
			LEFT JOIN enrollments ON enrollments.course_id = courses.id 
			AND enrollments.user_id = ? 
			AND enrollments.deleted_at IS NULL
		`, userID)
	}

	// Apply same filters as count query
	if query.Search != "" {
		searchTerm := "%" + strings.ToLower(query.Search) + "%"
		db = db.Where("LOWER(courses.title) LIKE ? OR LOWER(courses.description) LIKE ?", searchTerm, searchTerm)
	}

	if query.Category != "" {
		db = db.Where("courses.category = ?", query.Category)
	}

	if query.Difficulty != "" {
		db = db.Where("courses.difficulty = ?", query.Difficulty)
	}

	if query.Published != nil {
		db = db.Where("courses.is_published = ?", *query.Published)
	}

	// Add new filters
	if query.MinPrice > 0 {
		db = db.Where("courses.price >= ?", query.MinPrice)
	}

	if query.MaxPrice > 0 {
		db = db.Where("courses.price <= ?", query.MaxPrice)
	}

	if query.InstructorID > 0 {
		db = db.Where("courses.instructor_id = ?", query.InstructorID)
	}

	// Add WHERE for soft deletes
	db = db.Where("courses.deleted_at IS NULL")

	// Apply sorting
	sortBy := query.SortBy
	if sortBy == "" {
		sortBy = "created_at" // default sort
	}

	sortOrder := query.SortOrder
	if sortOrder == "" {
		sortOrder = "desc" // default order
	}

	// Build order clause
	var orderClause string
	switch sortBy {
	case "title":
		orderClause = "courses.title " + sortOrder
	case "price":
		orderClause = "courses.price " + sortOrder
	case "rating":
		// For rating, we need to join with review summary or calculate on the fly
		// For now, we'll sort by enrolled_count as a proxy for popularity
		orderClause = "courses.enrolled_count " + sortOrder
	case "popularity":
		orderClause = "courses.enrolled_count " + sortOrder
	case "enrollment_count":
		orderClause = "courses.enrolled_count " + sortOrder
	case "updated_at":
		orderClause = "courses.updated_at " + sortOrder
	case "created_at":
		fallthrough
	default:
		orderClause = "courses.created_at " + sortOrder
	}

	// Fetch courses with metadata
	if err := db.Order(orderClause).Limit(limit).Offset(offset).Scan(&coursesWithMeta).Error; err != nil {
		logger.Error("Database error fetching courses with metadata",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Int("limit", limit),
			zap.Int("offset", offset),
		)
		return nil, 0, err
	}

	return coursesWithMeta, int(total), nil
}

func (r *repository) UpdateCourse(ctx context.Context, course *Course) error {
	return r.db.WithContext(ctx).Model(course).Select(
		"title", "slug", "description", "thumbnail_url", "category",
		"difficulty", "price", "is_published",
	).Updates(course).Error
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
	err := r.db.WithContext(ctx).Create(lesson).Error
	if err != nil {
		logger.Error("Failed to create lesson in database",
			zap.Error(err),
			zap.Uint("course_id", lesson.CourseID),
			zap.String("title", lesson.Title),
		)
		return err
	}
	return nil
}

func (r *repository) FindLessonByID(ctx context.Context, id uint) (*Lesson, error) {
	var lesson Lesson
	if err := r.db.WithContext(ctx).First(&lesson, id).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Error("Database error finding lesson by ID",
				zap.Error(err),
				zap.Uint("lesson_id", id),
			)
		}
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

// BatchUpdateLessonOrder updates order_index for multiple lessons in a transaction
func (r *repository) BatchUpdateLessonOrder(ctx context.Context, updates []LessonOrderUpdate) error {
	// Use transaction to ensure atomicity
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, update := range updates {
			if err := tx.Model(&Lesson{}).
				Where("id = ?", update.LessonID).
				Update("order_index", update.OrderIndex).Error; err != nil {
				logger.Error("Failed to update lesson order",
					zap.Error(err),
					zap.Uint("lesson_id", update.LessonID),
					zap.Int("order_index", update.OrderIndex),
				)
				return err
			}
		}
		return nil
	})
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

// GetUserEnrollments gets all enrollments for a user
func (r *repository) GetUserEnrollments(ctx context.Context, userID uint) ([]*Enrollment, error) {
	var enrollments []*Enrollment
	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("enrolled_at DESC").
		Find(&enrollments).Error; err != nil {
		return nil, err
	}
	return enrollments, nil
}
