package course

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"
)

var (
	ErrCourseNotFound      = errors.New("course not found")
	ErrLessonNotFound      = errors.New("lesson not found")
	ErrUnauthorized        = errors.New("unauthorized access")
	ErrAlreadyEnrolled     = errors.New("already enrolled in this course")
	ErrNotEnrolled         = errors.New("not enrolled in this course")
	ErrCourseNotPublished  = errors.New("course is not published")
	ErrInvalidSlug         = errors.New("invalid slug format")
)

type Service interface {
	// Course operations
	CreateCourse(ctx context.Context, userID uint, req *CreateCourseRequest) (*Course, error)
	GetCourseByID(ctx context.Context, userID uint, id uint) (*CourseResponse, error)
	GetCourseBySlug(ctx context.Context, userID uint, slug string) (*CourseResponse, error)
	ListCourses(ctx context.Context, userID uint, query *CourseListQuery) (*CourseListResponse, error)
	UpdateCourse(ctx context.Context, userID uint, courseID uint, req *UpdateCourseRequest) (*Course, error)
	DeleteCourse(ctx context.Context, userID uint, courseID uint) error

	// Lesson operations
	CreateLesson(ctx context.Context, userID uint, courseID uint, req *CreateLessonRequest) (*Lesson, error)
	GetLesson(ctx context.Context, userID uint, lessonID uint) (*LessonResponse, error)
	GetCourseLessons(ctx context.Context, userID uint, courseID uint) ([]*LessonResponse, error)
	UpdateLesson(ctx context.Context, userID uint, lessonID uint, req *UpdateLessonRequest) (*Lesson, error)
	DeleteLesson(ctx context.Context, userID uint, lessonID uint) error
	ReorderLessons(ctx context.Context, userID uint, updates []LessonOrderUpdate) error

	// Enrollment operations
	EnrollCourse(ctx context.Context, userID uint, courseID uint) error
	UnenrollCourse(ctx context.Context, userID uint, courseID uint) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// Helper: Generate slug from title
func generateSlug(title string) string {
	// Convert to lowercase
	slug := strings.ToLower(title)
	
	// Replace spaces and special chars with hyphens
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")
	
	// Remove leading/trailing hyphens
	slug = strings.Trim(slug, "-")
	
	return slug
}

// Course operations

func (s *service) CreateCourse(ctx context.Context, userID uint, req *CreateCourseRequest) (*Course, error) {
	slug := generateSlug(req.Title)
	
	course := &Course{
		Title:        req.Title,
		Slug:         slug,
		Description:  req.Description,
		ThumbnailURL: req.ThumbnailURL,
		Category:     req.Category,
		Difficulty:   req.Difficulty,
		InstructorID: userID,
		Price:        req.Price,
		IsPublished:  false,
	}

	if err := s.repo.CreateCourse(ctx, course); err != nil {
		return nil, err
	}

	return course, nil
}

func (s *service) GetCourseByID(ctx context.Context, userID uint, id uint) (*CourseResponse, error) {
	course, err := s.repo.FindCourseByID(ctx, id)
	if err != nil {
		return nil, ErrCourseNotFound
	}

	// Count lessons
	lessonCount, err := s.repo.CountLessonsByCourseID(ctx, id)
	if err != nil {
		lessonCount = 0
	}

	// Check enrollment status
	isEnrolled := false
	if userID > 0 {
		isEnrolled, _ = s.repo.IsUserEnrolled(ctx, userID, id)
	}

	return course.ToResponse(lessonCount, isEnrolled), nil
}

func (s *service) GetCourseBySlug(ctx context.Context, userID uint, slug string) (*CourseResponse, error) {
	course, err := s.repo.FindCourseBySlug(ctx, slug)
	if err != nil {
		return nil, ErrCourseNotFound
	}

	// Count lessons
	lessonCount, err := s.repo.CountLessonsByCourseID(ctx, course.ID)
	if err != nil {
		lessonCount = 0
	}

	// Check enrollment status
	isEnrolled := false
	if userID > 0 {
		isEnrolled, _ = s.repo.IsUserEnrolled(ctx, userID, course.ID)
	}

	return course.ToResponse(lessonCount, isEnrolled), nil
}

func (s *service) ListCourses(ctx context.Context, userID uint, query *CourseListQuery) (*CourseListResponse, error) {
	// Use optimized query that solves N+1 problem (1 query instead of 201 for 100 courses)
	coursesWithMeta, total, err := s.repo.FindAllCoursesWithMeta(ctx, userID, query)
	if err != nil {
		return nil, err
	}

	// Convert to response format (metadata already included)
	courseResponses := make([]*CourseResponse, 0, len(coursesWithMeta))
	for _, courseWithMeta := range coursesWithMeta {
		courseResponses = append(courseResponses, courseWithMeta.ToResponse())
	}

	// Calculate pagination
	page := query.Page
	if page < 1 {
		page = 1
	}
	limit := query.Limit
	if limit < 1 {
		limit = 10
	}
	totalPages := (total + limit - 1) / limit

	return &CourseListResponse{
		Courses: courseResponses,
		Pagination: PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *service) UpdateCourse(ctx context.Context, userID uint, courseID uint, req *UpdateCourseRequest) (*Course, error) {
	course, err := s.repo.FindCourseByID(ctx, courseID)
	if err != nil {
		return nil, ErrCourseNotFound
	}

	// Check authorization
	if course.InstructorID != userID {
		return nil, ErrUnauthorized
	}

	// Update fields if provided
	if req.Title != nil {
		course.Title = *req.Title
		course.Slug = generateSlug(*req.Title)
	}
	if req.Description != nil {
		course.Description = *req.Description
	}
	if req.ThumbnailURL != nil {
		course.ThumbnailURL = *req.ThumbnailURL
	}
	if req.Category != nil {
		course.Category = *req.Category
	}
	if req.Difficulty != nil {
		course.Difficulty = *req.Difficulty
	}
	if req.Price != nil {
		course.Price = *req.Price
	}
	if req.IsPublished != nil {
		course.IsPublished = *req.IsPublished
	}

	if err := s.repo.UpdateCourse(ctx, course); err != nil {
		return nil, err
	}

	return course, nil
}

func (s *service) DeleteCourse(ctx context.Context, userID uint, courseID uint) error {
	course, err := s.repo.FindCourseByID(ctx, courseID)
	if err != nil {
		return ErrCourseNotFound
	}

	// Check authorization
	if course.InstructorID != userID {
		return ErrUnauthorized
	}

	return s.repo.DeleteCourse(ctx, courseID)
}

// Lesson operations

func (s *service) CreateLesson(ctx context.Context, userID uint, courseID uint, req *CreateLessonRequest) (*Lesson, error) {
	// Verify course exists and user is instructor
	course, err := s.repo.FindCourseByID(ctx, courseID)
	if err != nil {
		return nil, ErrCourseNotFound
	}

	if course.InstructorID != userID {
		return nil, ErrUnauthorized
	}

	slug := generateSlug(req.Title)

	lesson := &Lesson{
		CourseID:    courseID,
		Title:       req.Title,
		Slug:        slug,
		Content:     req.Content,
		OrderIndex:  req.OrderIndex,
		Duration:    req.Duration,
		IsPublished: false,
	}

	if err := s.repo.CreateLesson(ctx, lesson); err != nil {
		return nil, err
	}

	return lesson, nil
}

func (s *service) GetLesson(ctx context.Context, userID uint, lessonID uint) (*LessonResponse, error) {
	lesson, err := s.repo.FindLessonByID(ctx, lessonID)
	if err != nil {
		return nil, ErrLessonNotFound
	}

	// Check if user is enrolled or is the instructor
	course, err := s.repo.FindCourseByID(ctx, lesson.CourseID)
	if err != nil {
		return nil, ErrCourseNotFound
	}

	isInstructor := course.InstructorID == userID
	isEnrolled := false
	if userID > 0 {
		isEnrolled, _ = s.repo.IsUserEnrolled(ctx, userID, lesson.CourseID)
	}

	// Only enrolled users or instructor can see unpublished lessons
	if !lesson.IsPublished && !isInstructor && !isEnrolled {
		return nil, ErrUnauthorized
	}

	// Include content only for enrolled users or instructor
	includeContent := isInstructor || isEnrolled
	return lesson.ToResponse(includeContent), nil
}

func (s *service) GetCourseLessons(ctx context.Context, userID uint, courseID uint) ([]*LessonResponse, error) {
	course, err := s.repo.FindCourseByID(ctx, courseID)
	if err != nil {
		return nil, ErrCourseNotFound
	}

	lessons, err := s.repo.FindLessonsByCourseID(ctx, courseID)
	if err != nil {
		return nil, err
	}

	// Check if user is enrolled or is the instructor
	isInstructor := course.InstructorID == userID
	isEnrolled := false
	if userID > 0 {
		isEnrolled, _ = s.repo.IsUserEnrolled(ctx, userID, courseID)
	}

	// Convert to response format
	responses := make([]*LessonResponse, 0, len(lessons))
	for _, lesson := range lessons {
		// Show published lessons to everyone, unpublished only to instructor/enrolled
		if lesson.IsPublished || isInstructor || isEnrolled {
			// Don't include content in list view
			responses = append(responses, lesson.ToResponse(false))
		}
	}
	return responses, nil
}

func (s *service) UpdateLesson(ctx context.Context, userID uint, lessonID uint, req *UpdateLessonRequest) (*Lesson, error) {
	lesson, err := s.repo.FindLessonByID(ctx, lessonID)
	if err != nil {
		return nil, ErrLessonNotFound
	}

	// Verify authorization
	course, err := s.repo.FindCourseByID(ctx, lesson.CourseID)
	if err != nil {
		return nil, ErrCourseNotFound
	}

	if course.InstructorID != userID {
		return nil, ErrUnauthorized
	}

	// Update fields
	if req.Title != nil {
		lesson.Title = *req.Title
		lesson.Slug = generateSlug(*req.Title)
	}
	if req.Content != nil {
		lesson.Content = *req.Content
	}
	if req.OrderIndex != nil {
		lesson.OrderIndex = *req.OrderIndex
	}
	if req.Duration != nil {
		lesson.Duration = *req.Duration
	}
	if req.IsPublished != nil {
		lesson.IsPublished = *req.IsPublished
	}

	if err := s.repo.UpdateLesson(ctx, lesson); err != nil {
		return nil, err
	}

	return lesson, nil
}

func (s *service) DeleteLesson(ctx context.Context, userID uint, lessonID uint) error {
	lesson, err := s.repo.FindLessonByID(ctx, lessonID)
	if err != nil {
		return ErrLessonNotFound
	}

	// Verify authorization
	course, err := s.repo.FindCourseByID(ctx, lesson.CourseID)
	if err != nil {
		return ErrCourseNotFound
	}

	if course.InstructorID != userID {
		return ErrUnauthorized
	}

	return s.repo.DeleteLesson(ctx, lessonID)
}

// ReorderLessons updates order_index for multiple lessons
func (s *service) ReorderLessons(ctx context.Context, userID uint, updates []LessonOrderUpdate) error {
	// Validate that user owns all lessons being reordered
	// We'll check the first lesson to get the course, then verify ownership
	if len(updates) == 0 {
		return errors.New("no updates provided")
	}

	// Get first lesson to determine course
	firstLesson, err := s.repo.FindLessonByID(ctx, updates[0].LessonID)
	if err != nil {
		return ErrLessonNotFound
	}

	// Verify user owns the course
	course, err := s.repo.FindCourseByID(ctx, firstLesson.CourseID)
	if err != nil {
		return ErrCourseNotFound
	}

	if course.InstructorID != userID {
		return ErrUnauthorized
	}

	// Batch update all lesson orders
	return s.repo.BatchUpdateLessonOrder(ctx, updates)
}

// Enrollment operations

func (s *service) EnrollCourse(ctx context.Context, userID uint, courseID uint) error {
	// Check if course exists
	course, err := s.repo.FindCourseByID(ctx, courseID)
	if err != nil {
		return ErrCourseNotFound
	}

	// Check if course is published
	if !course.IsPublished {
		return ErrCourseNotPublished
	}

	// Check if already enrolled
	enrolled, err := s.repo.IsUserEnrolled(ctx, userID, courseID)
	if err != nil {
		return err
	}
	if enrolled {
		return ErrAlreadyEnrolled
	}

	// Create enrollment
	enrollment := &Enrollment{
		UserID:     userID,
		CourseID:   courseID,
		Progress:   0,
		EnrolledAt: time.Now(),
	}

	if err := s.repo.CreateEnrollment(ctx, enrollment); err != nil {
		return err
	}

	// Increment enrolled count
	if err := s.repo.IncrementEnrolledCount(ctx, courseID); err != nil {
		return fmt.Errorf("failed to increment enrolled count: %w", err)
	}

	return nil
}

func (s *service) UnenrollCourse(ctx context.Context, userID uint, courseID uint) error {
	// Check if enrolled
	enrolled, err := s.repo.IsUserEnrolled(ctx, userID, courseID)
	if err != nil {
		return err
	}
	if !enrolled {
		return ErrNotEnrolled
	}

	// Delete enrollment
	if err := s.repo.DeleteEnrollment(ctx, userID, courseID); err != nil {
		return err
	}

	// Decrement enrolled count
	if err := s.repo.DecrementEnrolledCount(ctx, courseID); err != nil {
		return fmt.Errorf("failed to decrement enrolled count: %w", err)
	}

	return nil
}
