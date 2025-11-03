package progress

import (
	"github.com/gin-gonic/gin"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
)

func RegisterRoutes(router *gin.RouterGroup, handler *Handler, authMiddleware *middleware.AuthMiddleware) {
	// All progress routes require authentication
	progress := router.Group("/progress")
	progress.Use(authMiddleware.RequireAuth())
	{
		// Lesson progress routes
		progress.POST("/lessons/:id/complete", handler.MarkLessonComplete)
		
		// Course progress routes
		progress.GET("/courses/:id", handler.GetCourseProgress)
		
		// User progress routes
		progress.GET("/me", handler.GetUserProgress)
	}
}
