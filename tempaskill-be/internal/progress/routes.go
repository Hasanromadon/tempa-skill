package progress

import (
	"github.com/gin-gonic/gin"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
)

func RegisterRoutes(router *gin.RouterGroup, handler *Handler, authMiddleware *middleware.AuthMiddleware) {
	// All progress routes require authentication
	lessons := router.Group("/lessons")
	lessons.Use(authMiddleware.RequireAuth())
	{
		lessons.POST("/:id/complete", handler.MarkLessonComplete)
	}

	courses := router.Group("/courses")
	courses.Use(authMiddleware.RequireAuth())
	{
		courses.GET("/:id/progress", handler.GetCourseProgress)
	}

	users := router.Group("/users")
	users.Use(authMiddleware.RequireAuth())
	{
		users.GET("/me/progress", handler.GetUserProgress)
	}

	// Alias route for frontend compatibility
	progress := router.Group("/progress")
	progress.Use(authMiddleware.RequireAuth())
	{
		progress.GET("/me", handler.GetUserProgress) // Alias for /users/me/progress
	}
}
