package instructor

import (
	"context"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/logger"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repository interface {
	// GetMyStudents returns all students enrolled in instructor's courses
	GetMyStudents(ctx context.Context, instructorID uint, query *StudentListQuery) ([]InstructorStudentResponse, int64, error)
	// GetMyCourses returns all courses created by the instructor
	GetMyCourses(ctx context.Context, instructorID uint, query *CourseListQuery) ([]InstructorCourseResponse, int64, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetMyStudents(ctx context.Context, instructorID uint, query *StudentListQuery) ([]InstructorStudentResponse, int64, error) {
	var students []InstructorStudentResponse
	var total int64

	// Complex query to get students enrolled in instructor's courses
	// Using subquery approach to calculate completed courses to avoid scope issues
	baseQuery := r.db.WithContext(ctx).
		Table("users").
		Select(`
			users.id,
			users.name,
			users.email,
			users.avatar_url,
			COUNT(DISTINCT enrollments.course_id) as total_enrollments,
			COALESCE((
				SELECT COUNT(DISTINCT e2.course_id)
				FROM enrollments e2
				INNER JOIN courses c2 ON c2.id = e2.course_id AND c2.deleted_at IS NULL
				WHERE e2.user_id = users.id 
				AND c2.instructor_id = ?
				AND NOT EXISTS (
					SELECT 1 FROM lessons l 
					WHERE l.course_id = e2.course_id 
					AND l.deleted_at IS NULL
					AND NOT EXISTS (
						SELECT 1 FROM lesson_progress lp 
						WHERE lp.user_id = users.id 
						AND lp.lesson_id = l.id
					)
				)
			), 0) as completed_courses,
			MIN(enrollments.enrolled_at) as joined_at
		`, instructorID).
		Joins("INNER JOIN enrollments ON enrollments.user_id = users.id").
		Joins("INNER JOIN courses ON courses.id = enrollments.course_id AND courses.deleted_at IS NULL").
		Where("courses.instructor_id = ?", instructorID).
		Where("users.role = ?", "student"). // Only students
		Where("users.deleted_at IS NULL").
		Group("users.id, users.name, users.email, users.avatar_url")

	// Apply filters
	if query.Search != "" {
		searchPattern := "%" + query.Search + "%"
		baseQuery = baseQuery.Where("users.name LIKE ? OR users.email LIKE ?", searchPattern, searchPattern)
	}

	if query.CourseID > 0 {
		baseQuery = baseQuery.Where("enrollments.course_id = ?", query.CourseID)
	}

	// Count total
	countQuery := r.db.WithContext(ctx).
		Table("users").
		Select("COUNT(DISTINCT users.id)").
		Joins("INNER JOIN enrollments ON enrollments.user_id = users.id").
		Joins("INNER JOIN courses ON courses.id = enrollments.course_id AND courses.deleted_at IS NULL").
		Where("courses.instructor_id = ?", instructorID).
		Where("users.role = ?", "student").
		Where("users.deleted_at IS NULL")

	if query.Search != "" {
		searchPattern := "%" + query.Search + "%"
		countQuery = countQuery.Where("users.name LIKE ? OR users.email LIKE ?", searchPattern, searchPattern)
	}

	if query.CourseID > 0 {
		countQuery = countQuery.Where("enrollments.course_id = ?", query.CourseID)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		logger.Error("Failed to count instructor's students", zap.Error(err), zap.Uint("instructor_id", instructorID))
		return nil, 0, err
	}

	// Apply pagination
	offset := (query.Page - 1) * query.Limit
	if err := baseQuery.
		Order("joined_at DESC").
		Offset(offset).
		Limit(query.Limit).
		Scan(&students).Error; err != nil {
		logger.Error("Failed to list instructor's students", zap.Error(err), zap.Uint("instructor_id", instructorID))
		return nil, 0, err
	}

	// Get enrolled course titles for each student
	for i := range students {
		var courseNames []string
		err := r.db.WithContext(ctx).
			Table("courses").
			Select("courses.title").
			Joins("INNER JOIN enrollments ON enrollments.course_id = courses.id").
			Where("enrollments.user_id = ?", students[i].ID).
			Where("courses.instructor_id = ?", instructorID).
			Where("courses.deleted_at IS NULL").
			Where("enrollments.deleted_at IS NULL").
			Pluck("title", &courseNames).Error

		if err != nil {
			logger.Error("Failed to get enrolled courses for student",
				zap.Error(err),
				zap.Uint("student_id", students[i].ID),
			)
			students[i].EnrolledCourses = []string{}
		} else {
			students[i].EnrolledCourses = courseNames
		}

		// Calculate overall progress
		if students[i].TotalEnrollments > 0 {
			students[i].OverallProgress = float64(students[i].CompletedCourses) / float64(students[i].TotalEnrollments) * 100
		}
	}

	return students, total, nil
}

func (r *repository) GetMyCourses(ctx context.Context, instructorID uint, query *CourseListQuery) ([]InstructorCourseResponse, int64, error) {
	var courses []InstructorCourseResponse
	var total int64

	// Build query with aggregates
	baseQuery := r.db.WithContext(ctx).
		Table("courses").
		Select(`
			courses.id,
			courses.title,
			courses.slug,
			courses.description,
			courses.category,
			courses.difficulty,
			courses.price,
			courses.thumbnail_url,
			courses.is_published,
			courses.created_at,
			courses.updated_at,
			COUNT(DISTINCT lessons.id) as total_lessons,
			COUNT(DISTINCT enrollments.user_id) as total_students,
			COUNT(DISTINCT enrollments.id) as total_enrollments,
			COALESCE(SUM(CASE WHEN payment_transactions.transaction_status = 'success' OR payment_transactions.transaction_status = 'settlement' THEN payment_transactions.gross_amount ELSE 0 END), 0) as total_revenue,
			COALESCE(AVG(course_reviews.rating), 0) as average_rating,
			COUNT(DISTINCT course_reviews.id) as total_reviews
		`).
		Joins("LEFT JOIN lessons ON lessons.course_id = courses.id AND lessons.deleted_at IS NULL").
		Joins("LEFT JOIN enrollments ON enrollments.course_id = courses.id AND enrollments.deleted_at IS NULL").
		Joins("LEFT JOIN payment_transactions ON payment_transactions.course_id = courses.id").
		Joins("LEFT JOIN course_reviews ON course_reviews.course_id = courses.id").
		Where("courses.instructor_id = ?", instructorID).
		Where("courses.deleted_at IS NULL").
		Group("courses.id, courses.title, courses.slug, courses.description, courses.category, courses.difficulty, courses.price, courses.thumbnail_url, courses.is_published, courses.created_at, courses.updated_at")

	// Apply filters
	if query.Search != "" {
		searchPattern := "%" + query.Search + "%"
		baseQuery = baseQuery.Where("courses.title LIKE ? OR courses.description LIKE ?", searchPattern, searchPattern)
	}

	if query.Category != "" {
		baseQuery = baseQuery.Where("courses.category = ?", query.Category)
	}

	if query.Difficulty != "" {
		baseQuery = baseQuery.Where("courses.difficulty = ?", query.Difficulty)
	}

	if query.Published != nil {
		baseQuery = baseQuery.Where("courses.is_published = ?", *query.Published)
	}

	// Count total (without aggregates)
	countQuery := r.db.WithContext(ctx).
		Table("courses").
		Where("courses.instructor_id = ?", instructorID).
		Where("courses.deleted_at IS NULL")

	if query.Search != "" {
		searchPattern := "%" + query.Search + "%"
		countQuery = countQuery.Where("courses.title LIKE ? OR courses.description LIKE ?", searchPattern, searchPattern)
	}

	if query.Category != "" {
		countQuery = countQuery.Where("courses.category = ?", query.Category)
	}

	if query.Difficulty != "" {
		countQuery = countQuery.Where("courses.difficulty = ?", query.Difficulty)
	}

	if query.Published != nil {
		countQuery = countQuery.Where("courses.is_published = ?", *query.Published)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		logger.Error("Failed to count instructor's courses", zap.Error(err), zap.Uint("instructor_id", instructorID))
		return nil, 0, err
	}

	// Apply sorting
	orderClause := query.SortBy + " " + query.SortOrder
	baseQuery = baseQuery.Order(orderClause)

	// Apply pagination
	offset := (query.Page - 1) * query.Limit
	if err := baseQuery.
		Offset(offset).
		Limit(query.Limit).
		Scan(&courses).Error; err != nil {
		logger.Error("Failed to list instructor's courses", zap.Error(err), zap.Uint("instructor_id", instructorID))
		return nil, 0, err
	}

	return courses, total, nil
}
