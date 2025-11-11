package certificate

import (
	"github.com/gin-gonic/gin"
)

func RegisterCertificateRoutes(r *gin.Engine, handler *CertificateHandler, authMiddleware gin.HandlerFunc) {
	cert := r.Group("/api/v1/certificates")
	cert.Use(authMiddleware)
	{
		cert.GET("", handler.CheckEligibility) // Check eligibility by course_id query param
		cert.POST("/issue", handler.IssueCertificate)
		cert.GET("/me", handler.GetAllCertificates)
		cert.GET("/:id/download", handler.DownloadCertificate) // For PDF download
	}
}
