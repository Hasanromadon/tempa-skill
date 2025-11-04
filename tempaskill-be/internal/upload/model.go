package upload

import (
	"time"
)

// UploadResponse represents the response after successful file upload
type UploadResponse struct {
	URL      string `json:"url"`
	Filename string `json:"filename"`
	Size     int64  `json:"size"`
	MimeType string `json:"mime_type"`
}

// UploadedFile represents metadata about an uploaded file
type UploadedFile struct {
	Filename string
	Size     int64
	MimeType string
	Path     string
	URL      string
	UploadedAt time.Time
}
