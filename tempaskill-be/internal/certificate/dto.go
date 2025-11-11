package certificate

type IssueCertificateRequest struct {
	UserID   uint `json:"user_id"`
	CourseID uint `json:"course_id" binding:"required"`
}

type CertificateResponse struct {
	CertificateID string `json:"certificate_id"`
	UserName      string `json:"user_name"`
	CourseTitle   string `json:"course_title"`
	IssuedAt      string `json:"issued_at"`
	DownloadURL   string `json:"download_url"`
}

type CertificateEligibilityResponse struct {
	Eligible      bool                  `json:"eligible"`
	Certificate   *CertificateResponse  `json:"certificate,omitempty"`
	Progress      float64               `json:"progress"`
	Message       string                `json:"message"`
}
