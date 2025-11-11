package certificate

import (
	"github.com/jung-kurt/gofpdf"
	"bytes"
)

func GenerateCertificatePDF(userName, courseTitle, issuedAt, certID string) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 24)
	pdf.Cell(0, 20, "Sertifikat Penyelesaian Kursus")
	pdf.Ln(20)
	pdf.SetFont("Arial", "", 16)
	pdf.Cell(0, 12, "Diberikan kepada:")
	pdf.Ln(12)
	pdf.SetFont("Arial", "B", 20)
	pdf.Cell(0, 14, userName)
	pdf.Ln(14)
	pdf.SetFont("Arial", "", 16)
	pdf.Cell(0, 12, "Atas penyelesaian kursus:")
	pdf.Ln(12)
	pdf.SetFont("Arial", "B", 18)
	pdf.Cell(0, 12, courseTitle)
	pdf.Ln(16)
	pdf.SetFont("Arial", "", 14)
	pdf.Cell(0, 10, "Tanggal penyelesaian: "+issuedAt)
	pdf.Ln(10)
	pdf.Cell(0, 10, "ID Sertifikat: "+certID)
	pdf.Ln(20)
	pdf.SetFont("Arial", "I", 12)
	pdf.Cell(0, 10, "TempaSKill Platform")

       var buf bytes.Buffer
       err := pdf.Output(&buf)
       if err != nil {
	       return nil, err
       }
       return buf.Bytes(), nil
}
