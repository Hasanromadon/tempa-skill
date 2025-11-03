package progress

import (
	"context"
	"errors"
	"time"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/course"
)

var (
	ErrLessonNotFound     = errors.New("lesson not found")
	ErrCourseNotFound     = errors.New("course not found")
	ErrNotEnrolled        = errors.New("not enrolled in this course")
	ErrUnauthorized       = errors.New("unauthorized access")
)

type Service interface {
	MarkLessonComplete(ctx context.Context, userID, lessonID uint) (*CourseProgressResponse, error)
	GetCourseProgress(ctx context.Context, userID, courseID uint) (*CourseProgressResponse, error)
	GetUserProgress(ctx context.Context, userID uint) (*UserProgressSummary, error)
}

type service struct {
	repo       Repository
	courseRepo course.Repository
}

func NewService(repo Repository, courseRepo course.Repository) Service {
	return &service{
		repo:       repo,
		courseRepo: courseRepo,
	}
}

// MarkLessonComplete marks a lesson as completed
func (s *service) MarkLessonComplete(ctx context.Context, userID, lessonID uint) (*CourseProgressResponse, error) {
	// Get lesson to verify it exists and get course ID
	lesson, err := s.courseRepo.FindLessonByID(ctx, lessonID)
	if err != nil {
		return nil, ErrLessonNotFound
	}

	// Check if user is enrolled in the course
	enrolled, err := s.courseRepo.IsUserEnrolled(ctx, userID, lesson.CourseID)
	if err != nil {
		return nil, err
	}
	if !enrolled {
		return nil, ErrNotEnrolled
	}

	// Mark lesson as complete (idempotent)
	_, err = s.repo.MarkLessonComplete(ctx, userID, lessonID, lesson.CourseID)
	if err != nil {
		return nil, err
	}

	// Return updated course progress
	return s.GetCourseProgress(ctx, userID, lesson.CourseID)
}

// GetCourseProgress gets progress for a specific course
func (s *service) GetCourseProgress(ctx context.Context, userID, courseID uint) (*CourseProgressResponse, error) {
	// Verify course exists
	_, err := s.courseRepo.FindCourseByID(ctx, courseID)
	if err != nil {
		return nil, ErrCourseNotFound
	}

	// Check if user is enrolled
	enrolled, err := s.courseRepo.IsUserEnrolled(ctx, userID, courseID)
	if err != nil {
		return nil, err
	}
	if !enrolled {
		return nil, ErrNotEnrolled
	}

	// Get all lessons for the course
	lessons, err := s.courseRepo.FindLessonsByCourseID(ctx, courseID)
	if err != nil {
		return nil, err
	}

	// Get user's progress for this course
	progressRecords, err := s.repo.GetCourseProgress(ctx, userID, courseID)
	if err != nil {
		return nil, err
	}

	// Create a map for quick lookup
	progressMap := make(map[uint]*LessonProgress)
	for _, p := range progressRecords {
		progressMap[p.LessonID] = p
	}

	// Build lesson progress responses
	lessonResponses := make([]*LessonProgressResponse, 0, len(lessons))
	completedCount := 0

	for _, lesson := range lessons {
		progress, completed := progressMap[lesson.ID]
		var completedAt *time.Time
		if completed {
			completedAt = &progress.CompletedAt
			completedCount++
		}

		lessonResponses = append(lessonResponses, &LessonProgressResponse{
			LessonID:    lesson.ID,
			Title:       lesson.Title,
			IsCompleted: completed,
			CompletedAt: completedAt,
		})
	}

	// Calculate percentage
	totalLessons := len(lessons)
	percentage := 0.0
	if totalLessons > 0 {
		percentage = float64(completedCount) / float64(totalLessons) * 100
	}

	// Get enrollment date (started_at) and last accessed
	enrollment, _ := s.courseRepo.FindEnrollment(ctx, userID, courseID)
	var startedAt, lastAccessed *time.Time
	if enrollment != nil {
		startedAt = &enrollment.EnrolledAt
		// Last accessed is the most recent completion
		if len(progressRecords) > 0 {
			lastAccessed = &progressRecords[len(progressRecords)-1].CompletedAt
		}
	}

	return &CourseProgressResponse{
		CourseID:         courseID,
		UserID:           userID,
		CompletedLessons: completedCount,
		TotalLessons:     totalLessons,
		Percentage:       percentage,
		Lessons:          lessonResponses,
		StartedAt:        startedAt,
		LastAccessed:     lastAccessed,
	}, nil
}

// GetUserProgress gets progress summary for all enrolled courses
func (s *service) GetUserProgress(ctx context.Context, userID uint) (*UserProgressSummary, error) {
	// Get ALL enrollments first (source of truth)
	enrollments, err := s.courseRepo.GetUserEnrollments(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Get all progress data
	allProgress, err := s.repo.GetUserProgress(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Group progress by course for easy lookup
	courseProgressMap := make(map[uint][]*LessonProgress)
	for _, p := range allProgress {
		courseProgressMap[p.CourseID] = append(courseProgressMap[p.CourseID], p)
	}

	// Build summaries for all enrolled courses
	courseSummaries := make([]*CourseProgressSummary, 0)
	totalEnrolled := len(enrollments)
	totalCompleted := 0
	totalInProgress := 0

	// Iterate through enrollments (not progress!)
	for _, enrollment := range enrollments {
		course, err := s.courseRepo.FindCourseByID(ctx, enrollment.CourseID)
		if err != nil {
			continue // Skip if course not found
		}

		// Get total lessons for this course
		totalLessons, err := s.courseRepo.CountLessonsByCourseID(ctx, enrollment.CourseID)
		if err != nil {
			continue
		}

		// Get progress for this course (may be empty)
		progressList := courseProgressMap[enrollment.CourseID]
		completedLessons := len(progressList)

		// Calculate percentage
		percentage := 0.0
		if totalLessons > 0 {
			percentage = float64(completedLessons) / float64(totalLessons) * 100
		}

		// Determine status
		status := "not_started"
		var completedAt *time.Time
		if completedLessons > 0 {
			if completedLessons >= totalLessons {
				status = "completed"
				totalCompleted++
				// Use the latest completion as course completion
				latest := progressList[0].CompletedAt
				completedAt = &latest
			} else {
				status = "in_progress"
				totalInProgress++
			}
		}

		// Get last accessed time
		var lastAccessed *time.Time
		if len(progressList) > 0 {
			lastAccessed = &progressList[0].CompletedAt
		}

		isCompleted := status == "completed"

		courseSummaries = append(courseSummaries, &CourseProgressSummary{
			CourseID:           enrollment.CourseID,
			Title:              course.Title,
			Slug:               course.Slug,
			CourseTitle:        course.Title,        // Alias for frontend
			CourseSlug:         course.Slug,         // Alias for frontend
			ThumbnailURL:       &course.ThumbnailURL,
			Percentage:         percentage,
			ProgressPercentage: percentage,          // Alias for frontend
			CompletedLessons:   completedLessons,
			TotalLessons:       totalLessons,
			LastAccessed:       lastAccessed,
			LastActivity:       lastAccessed,        // Alias for frontend
			Status:             status,
			IsCompleted:        isCompleted,         // Computed field
			CompletedAt:        completedAt,
			EnrolledAt:         &enrollment.EnrolledAt,
		})
	}

	return &UserProgressSummary{
		TotalEnrolled:   totalEnrolled,
		TotalCompleted:  totalCompleted,
		TotalInProgress: totalInProgress,
		Courses:         courseSummaries,
	}, nil
}
