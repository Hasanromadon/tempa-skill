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
