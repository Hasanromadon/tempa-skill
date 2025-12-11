package certificate

import (
	"bytes"

	"github.com/jung-kurt/gofpdf"
)

// Brand Colors
const (
	ColorPrimaryR = 234
	ColorPrimaryG = 88
	ColorPrimaryB = 12
	
	ColorDarkR    = 30
	ColorDarkG    = 30
	ColorDarkB    = 35
)

func GenerateCertificatePDF(userName, courseTitle, issuedAt, certID string) ([]byte, error) {
	// 1. Setup PDF (Landscape A4)
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetTitle("Sertifikat Penyelesaian - TempaSkill", false)
	pdf.AddPage()

	// --- BACKGROUND ORNAMENTS ---
	drawBackgroundPattern(pdf)
	drawBorder(pdf)

	// --- HEADER ---
	// Logo & Brand Name
	drawLogo(pdf, 130, 20) // Draw programmatic logo centered top
	
	pdf.SetY(45)
	pdf.SetTextColor(ColorPrimaryR, ColorPrimaryG, ColorPrimaryB)
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(0, 5, "TEMPA SKILL PLATFORM", "", 1, "C", false, 0, "")

	// Certificate Title
	pdf.Ln(10)
	pdf.SetTextColor(ColorDarkR, ColorDarkG, ColorDarkB)
	pdf.SetFont("Times", "B", 36) // Serif font looks more official
	pdf.CellFormat(0, 10, "SERTIFIKAT PENYELESAIAN", "", 1, "C", false, 0, "")
	
	pdf.SetFont("Arial", "", 10)
	pdf.SetTextColor(100, 100, 100)
	pdf.CellFormat(0, 8, "No. Dokumen: "+certID, "", 1, "C", false, 0, "")

	// --- BODY ---
	pdf.Ln(10)
	pdf.SetFont("Arial", "", 14)
	pdf.SetTextColor(80, 80, 80)
	pdf.CellFormat(0, 10, "Diberikan dengan bangga kepada:", "", 1, "C", false, 0, "")

	// RECIPIENT NAME (The Hero Element)
	pdf.Ln(5)
	pdf.SetFont("Times", "BI", 32) // Bold Italic Serif
	pdf.SetTextColor(ColorDarkR, ColorDarkG, ColorDarkB)
	pdf.CellFormat(0, 20, userName, "B", 1, "C", false, 0, "") 
	
	// Course Context
	pdf.Ln(10)
	pdf.SetFont("Arial", "", 14)
	pdf.SetTextColor(80, 80, 80)
	pdf.CellFormat(0, 10, "Atas dedikasi dan keberhasilannya menyelesaikan kursus:", "", 1, "C", false, 0, "")

	// COURSE TITLE
	pdf.Ln(2)
	pdf.SetFont("Arial", "B", 22)
	pdf.SetTextColor(ColorPrimaryR, ColorPrimaryG, ColorPrimaryB) // Brand Orange
	pdf.MultiCell(0, 10, courseTitle, "", "C", false)

	// --- FOOTER & SIGNATURE ---
	drawFooter(pdf, issuedAt)

	// --- SEAL / BADGE ---
	drawBadge(pdf, 230, 130)

	// Output
	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// --- HELPER FUNCTIONS (ASSETS DALAM KODE) ---

func drawBorder(pdf *gofpdf.Fpdf) {
	// Outer Thick Orange Border
	pdf.SetDrawColor(ColorPrimaryR, ColorPrimaryG, ColorPrimaryB)
	pdf.SetLineWidth(3)
	pdf.Rect(10, 10, 277, 190, "D")

	// Inner Thin Grey Border
	pdf.SetDrawColor(200, 200, 200)
	pdf.SetLineWidth(0.5)
	pdf.Rect(15, 15, 267, 180, "D")
	
	// Corners Decoration (Corner Bracket)
	pdf.SetDrawColor(ColorPrimaryR, ColorPrimaryG, ColorPrimaryB)
	pdf.SetLineWidth(1)
	size := 10.0
	// Top Left
	pdf.Line(13, 13, 13+size, 13)
	pdf.Line(13, 13, 13, 13+size)
	// Top Right
	pdf.Line(284, 13, 284-size, 13)
	pdf.Line(284, 13, 284, 13+size)
	// Bottom Left
	pdf.Line(13, 197, 13+size, 197)
	pdf.Line(13, 197, 13, 197-size)
	// Bottom Right
	pdf.Line(284, 197, 284-size, 197)
	pdf.Line(284, 197, 284, 197-size)
}

func drawBackgroundPattern(pdf *gofpdf.Fpdf) {
	// Membuat pola garis halus di background (Watermark effect)
	pdf.SetDrawColor(245, 245, 245) // Very light grey
	pdf.SetLineWidth(0.2)
	
	// Diagonal lines
	for i := 0.0; i < 300.0; i += 10.0 {
		pdf.Line(0, i, i*1.5, 0)
	}
}

func drawLogo(pdf *gofpdf.Fpdf, x, y float64) {
	// Menggambar Logo Petir Sederhana (Vector) secara manual
	pdf.SetFillColor(ColorPrimaryR, ColorPrimaryG, ColorPrimaryB)
	
	// Draw Circle Background
	// "F" means Fill
	pdf.Circle(x+5, y+5, 8, "F")
	
	// Draw Lightning Bolt (White)
	pdf.SetFillColor(255, 255, 255)
	
	// ✅ PERBAIKAN: Gunakan 'Polygon' untuk menggambar bentuk kustom yang diisi warna
	points := []gofpdf.PointType{
		{X: x + 6, Y: y + 2},
		{X: x + 2, Y: y + 8},
		{X: x + 5, Y: y + 8},
		{X: x + 3, Y: y + 13},
		{X: x + 9, Y: y + 6},
		{X: x + 6, Y: y + 6},
		{X: x + 6, Y: y + 2}, // Kembali ke titik awal
	}
	
	// "F" style untuk Fill (Isi warna)
	pdf.Polygon(points, "F")
}
func drawFooter(pdf *gofpdf.Fpdf, date string) {
	pdf.SetY(150)
	
	// Left: Date
	pdf.SetFont("Arial", "", 12)
	pdf.SetTextColor(80, 80, 80)
	pdf.Text(30, 155, "Jakarta, Indonesia")
	pdf.Text(30, 161, date)

	// Right: Signature
	sigX := 200.0
	sigY := 155.0
	
	// Simulated Signature (Bezier Curve)
	pdf.SetDrawColor(ColorDarkR, ColorDarkG, ColorDarkB)
	pdf.SetLineWidth(0.8)
	pdf.MoveTo(sigX, sigY)
	
	// ✅ PERBAIKAN: Gunakan CurveBezierCubicTo untuk 6 argumen
	pdf.CurveBezierCubicTo(sigX+10, sigY-10, sigX+20, sigY+5, sigX+40, sigY-5)
	
	pdf.SetDrawColor(150, 150, 150)
	pdf.SetLineWidth(0.5)
	pdf.Line(sigX-10, sigY+10, sigX+50, sigY+10) // Signature Line

	pdf.SetY(170)
	pdf.SetX(sigX - 10)
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(60, 5, "CEO TempaSkill")
}

func drawBadge(pdf *gofpdf.Fpdf, x, y float64) {
	// Menggambar Stempel/Badge Validitas
	pdf.SetDrawColor(ColorPrimaryR, ColorPrimaryG, ColorPrimaryB)
	pdf.SetLineWidth(0.5)
	pdf.Circle(x, y, 15, "D") // Outer circle
	
	pdf.SetDrawColor(ColorPrimaryR, ColorPrimaryG, ColorPrimaryB)
	pdf.SetLineWidth(0.2)
	pdf.Circle(x, y, 13, "D") // Inner circle

	// Text inside badge (Circular text is hard in pure FPDF, using flat text)
	pdf.SetTextColor(ColorPrimaryR, ColorPrimaryG, ColorPrimaryB)
	pdf.SetFont("Arial", "B", 8)
	pdf.Text(x-8, y-2, "OFFICIAL")
	pdf.Text(x-11, y+2, "CERTIFIED")
	
	// Star in center
	pdf.SetFont("ZapfDingbats", "", 14)
	pdf.Text(x-2, y+7, "H") // 'H' in ZapfDingbats is a star
}