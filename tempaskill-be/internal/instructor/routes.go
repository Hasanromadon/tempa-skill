package instructor

import (
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(rg *gin.RouterGroup, handler *Handler, authMiddleware *middleware.AuthMiddleware) {
	instructor := rg.Group("/instructor")
	instructor.Use(authMiddleware.RequireAuth())
	instructor.Use(func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists || userRole != "instructor" {
			c.JSON(403, gin.H{"error": "Instructor access required"})
			c.Abort()
			return
		}
		c.Next()
	})
	{
		instructor.GET("/students", handler.GetMyStudents) // GET /instructor/students
	}
}
