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

// GetMyCourses godoc
// @Summary Get instructor's courses
// @Description Get all courses created by the authenticated instructor
// @Tags instructor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by title or description"
// @Param category query string false "Filter by category"
// @Param difficulty query string false "Filter by difficulty level"
// @Param published query boolean false "Filter by published status"
// @Param sort_by query string false "Sort field" default(created_at)
// @Param sort_order query string false "Sort order (asc/desc)" default(desc)
// @Success 200 {object} response.Response{data=InstructorCourseListResult}
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /instructor/courses [get]
func (h *Handler) GetMyCourses(c *gin.Context) {
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

	var query CourseListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.ValidationError(c, err)
		return
	}

	result, err := h.service.GetMyCourses(c.Request.Context(), userID.(uint), &query)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Courses retrieved successfully", result)
}
