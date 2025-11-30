package instructor

import (
	"net/http"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/response"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// GetMyStudents godoc
// @Summary Get instructor's students
// @Description Get all students enrolled in courses created by the instructor
// @Tags instructor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by name or email"
// @Param course_id query int false "Filter by specific course"
// @Success 200 {object} response.Response{data=InstructorStudentListResult}
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /instructor/students [get]
func (h *Handler) GetMyStudents(c *gin.Context) {
	// Get instructor ID from context
	userID, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	userRole, exists := c.Get("userRole")
	if !exists || userRole != "instructor" {
		response.Error(c, http.StatusForbidden, "Instructor access required", nil)
		return
	}

	var query StudentListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.ValidationError(c, err)
		return
	}

	result, err := h.service.GetMyStudents(c.Request.Context(), userID.(uint), &query)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Students retrieved successfully", result)
}
