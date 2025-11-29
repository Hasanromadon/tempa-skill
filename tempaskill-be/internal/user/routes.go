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

		// Protected routes
		protected := users.Group("")
		protected.Use(authMiddleware.RequireAuth())
		{
			protected.PATCH("/me", handler.UpdateProfile)
			protected.PATCH("/me/password", handler.ChangePassword)
		}

		// Admin routes
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
			admin.GET("", handler.ListUsers)       // GET /users (admin only)
			admin.DELETE("/:id", handler.DeleteUser) // DELETE /users/:id (admin only)
		}
	}
}
