package progress

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// MarkLessonComplete marks a lesson as completed
// POST /lessons/:id/complete
func (h *Handler) MarkLessonComplete(c *gin.Context) {
	// Get lesson ID from URL
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "Invalid lesson ID",
			},
		})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "UNAUTHORIZED",
				"message": "Unauthorized",
			},
		})
		return
	}

	// Mark lesson as complete
	progress, err := h.service.MarkLessonComplete(c.Request.Context(), userID.(uint), uint(id))
	if err != nil {
		if err == ErrLessonNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "LESSON_NOT_FOUND",
					"message": "Lesson not found",
				},
			})
			return
		}
		if err == ErrNotEnrolled {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NOT_ENROLLED",
					"message": "You must be enrolled in this course to mark lessons as complete",
				},
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    progress,
		"message": "Lesson marked as completed",
	})
}

// GetCourseProgress gets progress for a specific course
// GET /courses/:id/progress
func (h *Handler) GetCourseProgress(c *gin.Context) {
	// Get course ID from URL
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "Invalid course ID",
			},
		})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "UNAUTHORIZED",
				"message": "Unauthorized",
			},
		})
		return
	}

	// Get course progress
	progress, err := h.service.GetCourseProgress(c.Request.Context(), userID.(uint), uint(id))
	if err != nil {
		if err == ErrCourseNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "COURSE_NOT_FOUND",
					"message": "Course not found",
				},
			})
			return
		}
		if err == ErrNotEnrolled {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NOT_ENROLLED",
					"message": "You must be enrolled in this course to view progress",
				},
			})
			return
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "Resource not found",
				},
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    progress,
	})
}

// GetUserProgress gets progress summary for all enrolled courses
// GET /users/me/progress
func (h *Handler) GetUserProgress(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "UNAUTHORIZED",
				"message": "Unauthorized",
			},
		})
		return
	}

	// Get user progress
	progress, err := h.service.GetUserProgress(c.Request.Context(), userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    progress,
	})
}
