package course

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
)

func RegisterRoutes(router *gin.RouterGroup, db *gorm.DB, authMiddleware *middleware.AuthMiddleware) {
	// Initialize layers
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	// Public routes (no authentication required)
	public := router.Group("")
	{
		public.GET("/courses", handler.ListCourses)                    // List all courses with filters
		// Apply OptionalAuth to support is_enrolled field for logged-in users
		public.GET("/courses/slug/:slug", authMiddleware.OptionalAuth(), handler.GetCourseBySlug)     // Get course by slug (must be before :id)
		public.GET("/courses/:id", handler.GetCourse)                  // Get course by ID
		public.GET("/courses/:id/lessons", handler.GetCourseLessons)   // Get course lessons (public for curriculum preview)
		public.GET("/lessons/:id", handler.GetLesson)                  // Get lesson detail (public for preview)
	}

	// Protected routes (authentication required)
	protected := router.Group("")
	protected.Use(authMiddleware.RequireAuth())
	{
		// Course management (instructor only - authorization checked in service layer)
		protected.POST("/courses", handler.CreateCourse)          // Create new course
		protected.PATCH("/courses/:id", handler.UpdateCourse)     // Update course
		protected.DELETE("/courses/:id", handler.DeleteCourse)    // Delete course

		// Lesson management (instructor only - authorization checked in service layer)
		protected.POST("/courses/:id/lessons", handler.CreateLesson)  // Create lesson
		protected.PATCH("/lessons/:id", handler.UpdateLesson)          // Update lesson
		protected.DELETE("/lessons/:id", handler.DeleteLesson)         // Delete lesson

		// Enrollment (student)
		protected.POST("/courses/:id/enroll", handler.EnrollCourse)    // Enroll in course
		protected.DELETE("/courses/:id/enroll", handler.UnenrollCourse) // Unenroll from course
	}
}
