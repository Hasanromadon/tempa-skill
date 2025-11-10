package review

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, handler *ReviewHandler, authMiddleware gin.HandlerFunc) {
	// Review routes
	reviewGroup := router.Group("/api/v1/reviews")
	{
		// Public routes
		reviewGroup.GET("/:id", handler.GetReview)

		// Protected routes (require authentication)
		protected := reviewGroup.Group("")
		protected.Use(authMiddleware)
		{
			// User review management
			protected.POST("", handler.CreateReview)
			protected.PUT("/:id", handler.UpdateReview)
			protected.DELETE("/:id", handler.DeleteReview)
			protected.GET("/user", handler.GetUserReviews)
		}
	}

	// Course-specific review routes
	courseGroup := router.Group("/api/v1/reviews/courses")
	{
		// Public routes for course reviews
		courseGroup.GET("/:courseId", handler.GetCourseReviews)
		courseGroup.GET("/:courseId/summary", handler.GetCourseReviewSummary)
	}
}