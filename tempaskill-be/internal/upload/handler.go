package upload

import (
	"net/http"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/response"
	"github.com/gin-gonic/gin"
)

// Handler handles HTTP requests for file uploads
type Handler struct {
	service Service
}

// NewHandler creates a new upload handler
func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
	}
}

// UploadImage handles image upload requests
// @Summary Upload an image
// @Description Upload an image file to Firebase Storage (max 5MB, formats: jpg, png, gif, webp)
// @Tags upload
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Image file to upload"
// @Param folder formData string false "Upload folder (default: images)"
// @Success 200 {object} response.APIResponse{data=UploadResponse}
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Security BearerAuth
// @Router /upload/image [post]
func (h *Handler) UploadImage(c *gin.Context) {
	// Get uploaded file
	fileHeader, err := c.FormFile("file")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "No file uploaded", nil)
		return
	}

	// Get folder parameter (optional, default to "images")
	folder := c.PostForm("folder")
	if folder == "" {
		folder = "images"
	}

	// Validate folder name (prevent path traversal)
	if !isValidFolderName(folder) {
		response.Error(c, http.StatusBadRequest, "Invalid folder name", nil)
		return
	}

	// Upload file
	uploadedFile, err := h.service.UploadImage(c.Request.Context(), fileHeader, folder)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	// Return success response
	uploadResponse := &UploadResponse{
		URL:      uploadedFile.URL,
		Filename: uploadedFile.Filename,
		Size:     uploadedFile.Size,
		MimeType: uploadedFile.MimeType,
	}

	response.Success(c, http.StatusOK, "File uploaded successfully", uploadResponse)
}

// isValidFolderName validates folder name to prevent path traversal
func isValidFolderName(folder string) bool {
	// Only allow alphanumeric, dash, and underscore
	validFolders := []string{"images", "thumbnails", "avatars", "lessons"}
	for _, valid := range validFolders {
		if folder == valid {
			return true
		}
	}
	return false
}
