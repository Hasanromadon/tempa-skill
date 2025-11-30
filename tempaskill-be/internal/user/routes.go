package user

import (
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(rg *gin.RouterGroup, handler *Handler, authMiddleware *middleware.AuthMiddleware) {
	users := rg.Group("/users")
	{
		// Public routes
		users.GET("/:id", handler.GetUserByID)
		users.GET("/:id/enrollments", handler.GetUserEnrollments)
		users.GET("/:id/certificates", handler.GetUserCertificates)

		// Protected routes
		protected := users.Group("")
		protected.Use(authMiddleware.RequireAuth())
		{
			protected.PATCH("/me", handler.UpdateProfile)
			protected.PATCH("/me/password", handler.ChangePassword)
		}

		// Admin-only routes (full access to user management)
		// CHANGE: Instructor no longer has access to /users
		admin := users.Group("")
		admin.Use(authMiddleware.RequireAuth())
		admin.Use(func(c *gin.Context) {
			userRole, exists := c.Get("userRole")
			if !exists || userRole != "admin" {
				c.JSON(403, gin.H{"error": "Admin access required"})
				c.Abort()
				return
			}
			c.Next()
		})
		{
			admin.GET("", handler.ListUsers)                     // GET /users (admin only - all users)
			admin.PATCH("/:id/role", handler.ChangeUserRole)     // PATCH /users/:id/role (admin only)
			admin.PATCH("/:id/status", handler.ToggleUserStatus) // PATCH /users/:id/status (admin only)
			admin.DELETE("/:id", handler.DeleteUser)             // DELETE /users/:id (admin only)
		}
	}
}
