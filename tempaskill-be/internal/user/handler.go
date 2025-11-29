package user

import (
	"net/http"
	"strconv"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/response"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// GetUserByID godoc
// @Summary Get user by ID
// @Description Get public user profile by ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} response.Response{data=auth.UserResponse}
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /users/{id} [get]
func (h *Handler) GetUserByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}

	user, err := h.service.GetUserByID(c.Request.Context(), uint(id))
	if err != nil {
		if err == ErrUserNotFound {
			response.NotFound(c, "User not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "User retrieved successfully", user.ToResponse())
}

// UpdateProfile godoc
// @Summary Update user profile
// @Description Update authenticated user's profile
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body UpdateProfileRequest true "Update profile request"
// @Success 200 {object} response.Response{data=auth.UserResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /users/me [patch]
func (h *Handler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err)
		return
	}

	user, err := h.service.UpdateProfile(c.Request.Context(), userID.(uint), &req)
	if err != nil {
		if err == ErrUserNotFound {
			response.NotFound(c, "User not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Profile updated successfully", user.ToResponse())
}

// ChangePassword godoc
// @Summary Change user password
// @Description Change authenticated user's password
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body ChangePasswordRequest true "Change password request"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /users/me/password [patch]
func (h *Handler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err)
		return
	}

	if err := h.service.ChangePassword(c.Request.Context(), userID.(uint), &req); err != nil {
		if err == ErrUserNotFound {
			response.NotFound(c, "User not found")
			return
		}
		if err == ErrInvalidPassword {
			response.Error(c, http.StatusBadRequest, "Current password is incorrect", nil)
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Password changed successfully", nil)
}

// ListUsers godoc
// @Summary List all users (Admin only)
// @Description Get paginated list of all users with optional filters
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param role query string false "Filter by role" Enums(student, instructor, admin)
// @Param search query string false "Search by name or email"
// @Success 200 {object} response.Response{data=UserListResult}
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /users [get]
func (h *Handler) ListUsers(c *gin.Context) {
	var query UserListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.ValidationError(c, err)
		return
	}

	result, err := h.service.ListUsers(c.Request.Context(), &query)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Users retrieved successfully", result)
}

// ChangeUserRole godoc
// @Summary Change user role (Admin only)
// @Description Change a user's role (student, instructor, admin)
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Param request body ChangeRoleRequest true "Change role request"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /users/{id}/role [patch]
func (h *Handler) ChangeUserRole(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}

	var req ChangeRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err)
		return
	}

	if err := h.service.ChangeUserRole(c.Request.Context(), uint(id), &req); err != nil {
		if err == ErrUserNotFound {
			response.NotFound(c, "User not found")
			return
		}
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "User role updated successfully", nil)
}

// ToggleUserStatus godoc
// @Summary Toggle user status (Admin only)
// @Description Suspend or activate a user account
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Param suspend query bool true "Suspend user (true) or activate (false)"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /users/{id}/status [patch]
func (h *Handler) ToggleUserStatus(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}

	// Get suspend query parameter
	suspendStr := c.Query("suspend")
	suspend := suspendStr == "true"

	if err := h.service.ToggleUserStatus(c.Request.Context(), uint(id), suspend); err != nil {
		if err == ErrUserNotFound {
			response.NotFound(c, "User not found")
			return
		}
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	statusMsg := "activated"
	if suspend {
		statusMsg = "suspended"
	}
	response.Success(c, http.StatusOK, "User "+statusMsg+" successfully", nil)
}

// DeleteUser godoc
// @Summary Delete user (Admin only)
// @Description Delete a user by ID
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /users/{id} [delete]
func (h *Handler) DeleteUser(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}

	if err := h.service.DeleteUser(c.Request.Context(), uint(id)); err != nil {
		if err == ErrUserNotFound {
			response.NotFound(c, "User not found")
			return
		}
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "User deleted successfully", nil)
}

// GetUserEnrollments godoc
// @Summary Get user enrollments
// @Description Get all courses enrolled by a specific user
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} response.Response{data=[]UserEnrollment}
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /users/{id}/enrollments [get]
func (h *Handler) GetUserEnrollments(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}

	enrollments, err := h.service.GetUserEnrollments(c.Request.Context(), uint(id))
	if err != nil {
		if err == ErrUserNotFound {
			response.NotFound(c, "User not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "User enrollments retrieved successfully", enrollments)
}

// GetUserCertificates godoc
// @Summary Get user certificates
// @Description Get all certificates earned by a specific user
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} response.Response{data=[]UserCertificate}
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /users/{id}/certificates [get]
func (h *Handler) GetUserCertificates(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}

	certificates, err := h.service.GetUserCertificates(c.Request.Context(), uint(id))
	if err != nil {
		if err == ErrUserNotFound {
			response.NotFound(c, "User not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "User certificates retrieved successfully", certificates)
}
