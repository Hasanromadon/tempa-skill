package review

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	service ReviewService
}

func NewHandler(service ReviewService) *ReviewHandler {
	return &ReviewHandler{service: service}
}

// CreateReview handles POST /api/v1/reviews
func (h *ReviewHandler) CreateReview(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	review, err := h.service.CreateReview(userID.(uint), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Review created successfully",
		"data":    review,
	})
}

// UpdateReview handles PUT /api/v1/reviews/:id
func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Get review ID from URL
	reviewIDStr := c.Param("id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid review ID",
		})
		return
	}

	var req UpdateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	review, err := h.service.UpdateReview(userID.(uint), uint(reviewID), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Review updated successfully",
		"data":    review,
	})
}

// DeleteReview handles DELETE /api/v1/reviews/:id
func (h *ReviewHandler) DeleteReview(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Get review ID from URL
	reviewIDStr := c.Param("id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid review ID",
		})
		return
	}

	err = h.service.DeleteReview(userID.(uint), uint(reviewID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Review deleted successfully",
	})
}

// GetReview handles GET /api/v1/reviews/:id
func (h *ReviewHandler) GetReview(c *gin.Context) {
	reviewIDStr := c.Param("id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid review ID",
		})
		return
	}

	review, err := h.service.GetReview(uint(reviewID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Review not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Review retrieved successfully",
		"data":    review,
	})
}

// GetCourseReviews handles GET /api/v1/courses/:courseId/reviews
func (h *ReviewHandler) GetCourseReviews(c *gin.Context) {
	courseIDStr := c.Param("courseId")
	courseID, err := strconv.ParseUint(courseIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid course ID",
		})
		return
	}

	// Parse pagination parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 50 {
		limit = 10
	}

	result, err := h.service.GetCourseReviews(uint(courseID), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve reviews",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Course reviews retrieved successfully",
		"data":    result,
	})
}

// GetUserReviews handles GET /api/v1/reviews/user
func (h *ReviewHandler) GetUserReviews(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Parse pagination parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 50 {
		limit = 10
	}

	reviews, total, err := h.service.GetUserReviews(userID.(uint), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve user reviews",
		})
		return
	}

	totalPages := (total + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"message": "User reviews retrieved successfully",
		"data":    reviews,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// GetCourseReviewSummary handles GET /api/v1/courses/:courseId/reviews/summary
func (h *ReviewHandler) GetCourseReviewSummary(c *gin.Context) {
	courseIDStr := c.Param("courseId")
	courseID, err := strconv.ParseUint(courseIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid course ID",
		})
		return
	}

	summary, err := h.service.GetCourseReviewSummary(uint(courseID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve review summary",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Review summary retrieved successfully",
		"data":    summary,
	})
}