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
	}
}
