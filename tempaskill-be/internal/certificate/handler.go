package certificate

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"fmt"
)

type CertificateHandler struct {
	service CertificateService

}

func NewCertificateHandler(service CertificateService) *CertificateHandler {
	return &CertificateHandler{service: service}
}

func (h *CertificateHandler) IssueCertificate(c *gin.Context) {
	var req IssueCertificateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Set user_id from JWT context
	req.UserID = c.GetUint("userID")
	cert, err := h.service.IssueCertificate(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Sertifikat berhasil dibuat", "data": cert})
}

func (h *CertificateHandler) CheckEligibility(c *gin.Context) {
	userID := c.GetUint("userID") // from auth middleware
	courseIDStr := c.Query("course_id")
	var courseID uint
	if courseIDStr != "" {
		var parsed int
		_, err := fmt.Sscanf(courseIDStr, "%d", &parsed)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "course_id harus berupa angka"})
			return
		}
		courseID = uint(parsed)
	}
	eligibility, err := h.service.GetCertificate(userID, courseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": eligibility})
}

func (h *CertificateHandler) GetAllCertificates(c *gin.Context) {
	userID := c.GetUint("userID") // from auth middleware
	certs, err := h.service.GetAllCertificates(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": certs})
}

// DownloadCertificate serves the PDF for a certificate
func (h *CertificateHandler) DownloadCertificate(c *gin.Context) {
	certID := c.Param("id")
	cert, err := h.service.FindByCertificateID(certID)
	if err != nil || cert == nil {
		 c.JSON(http.StatusNotFound, gin.H{"error": "Sertifikat tidak ditemukan"})
		 return
	}
       // TODO: Fetch user and course info for PDF if needed
       // For now, use placeholder names
       userName := "Nama Pengguna"
       courseTitle := "Judul Kursus"
       pdfBytes, err := GenerateCertificatePDF(userName, courseTitle, cert.IssuedAt.Format("2006-01-02"), cert.CertificateID)
       if err != nil {
	       c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat PDF"})
	       return
       }
       c.Header("Content-Type", "application/pdf")
       c.Header("Content-Disposition", "attachment; filename=sertifikat.pdf")
       c.Data(http.StatusOK, "application/pdf", pdfBytes)
}
