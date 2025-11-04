package upload

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/firebase"
	"github.com/google/uuid"
)

// Service handles file upload operations
type Service interface {
	UploadImage(ctx context.Context, file *multipart.FileHeader, folder string) (*UploadedFile, error)
}

type service struct{}

// NewService creates a new upload service
func NewService() Service {
	return &service{}
}

// UploadImage uploads an image file to Firebase Storage
func (s *service) UploadImage(ctx context.Context, fileHeader *multipart.FileHeader, folder string) (*UploadedFile, error) {
	// Validate file type
	contentType := fileHeader.Header.Get("Content-Type")
	if !isValidImageType(contentType) {
		return nil, fmt.Errorf("invalid file type: %s. Allowed: jpg, jpeg, png, gif, webp", contentType)
	}

	// Validate file size (max 5MB)
	maxSize := int64(5 * 1024 * 1024) // 5MB
	if fileHeader.Size > maxSize {
		return nil, fmt.Errorf("file too large: %d bytes. Maximum: %d bytes (5MB)", fileHeader.Size, maxSize)
	}

	// Open the uploaded file
	src, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()

	// Generate unique filename
	ext := filepath.Ext(fileHeader.Filename)
	uniqueFilename := fmt.Sprintf("%s%s", uuid.New().String(), ext)

	// Construct path: folder/year/month/filename
	now := time.Now()
	path := filepath.Join(folder, fmt.Sprintf("%d", now.Year()), fmt.Sprintf("%02d", now.Month()), uniqueFilename)
	path = strings.ReplaceAll(path, "\\", "/") // Use forward slashes for cloud storage

	// Get Firebase Storage client
	storageClient := firebase.GetStorageClient()
	bucket, err := storageClient.DefaultBucket()
	if err != nil {
		return nil, fmt.Errorf("failed to get storage bucket: %v", err)
	}

	// Create object handle
	obj := bucket.Object(path)

	// Upload file
	writer := obj.NewWriter(ctx)
	writer.ContentType = contentType

	// Copy file content
	if _, err := io.Copy(writer, src); err != nil {
		writer.Close()
		return nil, fmt.Errorf("failed to upload file: %v", err)
	}

	// Close writer
	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("failed to close writer: %v", err)
	}

	// Make file publicly accessible
	if err := obj.ACL().Set(ctx, "allUsers", "READER"); err != nil {
		return nil, fmt.Errorf("failed to make file public: %v", err)
	}

	// Get public URL
	attrs, err := obj.Attrs(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get file attributes: %v", err)
	}

	publicURL := fmt.Sprintf("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
		attrs.Bucket, strings.ReplaceAll(path, "/", "%2F"))

	return &UploadedFile{
		Filename:   fileHeader.Filename,
		Size:       fileHeader.Size,
		MimeType:   contentType,
		Path:       path,
		URL:        publicURL,
		UploadedAt: time.Now(),
	}, nil
}

// isValidImageType checks if the content type is a valid image type
func isValidImageType(contentType string) bool {
	validTypes := []string{
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
	}

	for _, validType := range validTypes {
		if contentType == validType {
			return true
		}
	}

	return false
}
