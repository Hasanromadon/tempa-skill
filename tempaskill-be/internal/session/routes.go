package session

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

	// Protected routes (authentication required)
	protected := router.Group("")
	protected.Use(authMiddleware.RequireAuth())
	{
		// Session management
		protected.POST("/sessions", handler.CreateSession)                    // Create new session
		protected.GET("/sessions", handler.ListSessions)                     // List sessions with filters
		protected.GET("/sessions/:id", handler.GetSession)                   // Get session by ID
		protected.PUT("/sessions/:id", handler.UpdateSession)                // Update session
		protected.DELETE("/sessions/:id", handler.DeleteSession)             // Delete session

		// Session participation
		protected.POST("/sessions/:id/register", handler.RegisterForSession)     // Register for session
		protected.DELETE("/sessions/:id/register", handler.UnregisterFromSession) // Unregister from session

		// Instructor-only routes
		protected.GET("/sessions/:id/participants", handler.GetSessionParticipants) // Get session participants (instructor only)
		protected.POST("/sessions/:id/attendance/:participantId", handler.MarkAttendance) // Mark attendance (instructor only)
	}
}