
package certificate

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/progress"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/user"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/course"
)

type CertificateService interface {
	IssueCertificate(req IssueCertificateRequest) (*CertificateResponse, error)
	GetCertificate(userID, courseID uint) (*CertificateEligibilityResponse, error)
	GetAllCertificates(userID uint) ([]*CertificateResponse, error)
	FindByCertificateID(certID string) (*Certificate, error)
}

type certificateService struct {
	repo CertificateRepository
	progress progress.Service
	userRepo user.Repository
	courseRepo course.Repository
}

func NewCertificateService(repo CertificateRepository) CertificateService {
	// Add progress service as parameter
	return &certificateService{repo: repo, progress: nil}
}
// Overloaded constructor to accept progress service
func NewCertificateServiceWithProgress(repo CertificateRepository, progress progress.Service) CertificateService {
	return &certificateService{repo: repo, progress: progress}
}

func NewCertificateServiceFull(repo CertificateRepository, progress progress.Service, userRepo user.Repository, courseRepo course.Repository) CertificateService {
	return &certificateService{repo: repo, progress: progress, userRepo: userRepo, courseRepo: courseRepo}
}

func (s *certificateService) GetUserRepository() user.Repository {
	return s.userRepo
}

func (s *certificateService) GetCourseRepository() course.Repository {
	return s.courseRepo
}

func (s *certificateService) IssueCertificate(req IssueCertificateRequest) (*CertificateResponse, error) {
	// Check if already issued
	existing, _ := s.repo.FindByUserAndCourse(req.UserID, req.CourseID)
	if existing != nil {
		return nil, errors.New("certificate already issued")
	}

	// Check course completion
	ctx := context.Background()
	progressResp, err := s.progress.GetCourseProgress(ctx, req.UserID, req.CourseID)
	if err != nil {
		return nil, errors.New("progress not found")
	}
	if progressResp.Percentage < 100.0 {
		return nil, errors.New("kursus belum selesai. Sertifikat hanya tersedia jika semua pelajaran telah diselesaikan.")
	}

	certID := fmt.Sprintf("CERT-%d-%d-%d", req.UserID, req.CourseID, time.Now().Unix())
	cert := &Certificate{
		UserID:       req.UserID,
		CourseID:     req.CourseID,
		IssuedAt:     time.Now(),
		CertificateID: certID,
	}
	if err := s.repo.Create(cert); err != nil {
		return nil, err
	}

	// Fetch user name and course title
	userName := ""
	courseTitle := ""
	if s.userRepo != nil {
		user, err := s.userRepo.FindByID(context.Background(), req.UserID)
		if err == nil && user != nil {
			userName = user.Name
		}
	}
	if s.courseRepo != nil {
		course, err := s.courseRepo.FindCourseByID(context.Background(), req.CourseID)
		if err == nil && course != nil {
			courseTitle = course.Title
		}
	}
	resp := &CertificateResponse{
		CertificateID: cert.CertificateID,
		UserName:      userName,
		CourseTitle:   courseTitle,
		IssuedAt:      cert.IssuedAt.Format("2006-01-02"),
		DownloadURL:   fmt.Sprintf("/api/v1/certificates/%s/download", cert.CertificateID),
	}
	return resp, nil
}

func (s *certificateService) GetCertificate(userID, courseID uint) (*CertificateEligibilityResponse, error) {
	// First check if certificate already exists
	cert, err := s.repo.FindByUserAndCourse(userID, courseID)
	if err == nil && cert != nil {
		// Certificate exists, return it
		// Fetch user name and course title
		userName := ""
		courseTitle := ""
		if s.userRepo != nil {
			user, err := s.userRepo.FindByID(context.Background(), userID)
			if err == nil && user != nil {
				userName = user.Name
			}
		}
		if s.courseRepo != nil {
			course, err := s.courseRepo.FindCourseByID(context.Background(), courseID)
			if err == nil && course != nil {
				courseTitle = course.Title
			}
		}
		resp := &CertificateResponse{
			CertificateID: cert.CertificateID,
			UserName:      userName,
			CourseTitle:   courseTitle,
			IssuedAt:      cert.IssuedAt.Format("2006-01-02"),
			DownloadURL:   fmt.Sprintf("/api/v1/certificates/%s/download", cert.CertificateID),
		}
		return &CertificateEligibilityResponse{
			Eligible:    true,
			Certificate: resp,
			Progress:    100.0,
			Message:     "Sertifikat sudah diterbitkan",
		}, nil
	}

	// Certificate doesn't exist, check eligibility (course completion)
	progressResp, err := s.progress.GetCourseProgress(context.Background(), userID, courseID)
	if err != nil {
		// Check for specific errors
		if err.Error() == "not enrolled in this course" {
			return &CertificateEligibilityResponse{
				Eligible: false,
				Progress: 0,
				Message:  "Belum terdaftar di kursus ini",
			}, nil
		}
		return &CertificateEligibilityResponse{
			Eligible: false,
			Progress: 0,
			Message:  "Gagal memeriksa progress kursus",
		}, nil
	}

	progressValue := progressResp.Percentage
	if progressValue < 100 {
		return &CertificateEligibilityResponse{
			Eligible: false,
			Progress: progressValue,
			Message:  fmt.Sprintf("Kursus belum selesai - progress: %.1f%%", progressValue),
		}, nil
	}

	// User is eligible but hasn't issued certificate yet
	return &CertificateEligibilityResponse{
		Eligible: true,
		Progress: progressValue,
		Message:  "Berhak mendapatkan sertifikat",
	}, nil
}

func (s *certificateService) GetAllCertificates(userID uint) ([]*CertificateResponse, error) {
	certs, err := s.repo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	var responses []*CertificateResponse
	for _, cert := range certs {
		userName := ""
		courseTitle := ""
		if s.userRepo != nil {
			user, err := s.userRepo.FindByID(context.Background(), cert.UserID)
			if err == nil && user != nil {
				userName = user.Name
			}
		}
		if s.courseRepo != nil {
			course, err := s.courseRepo.FindCourseByID(context.Background(), cert.CourseID)
			if err == nil && course != nil {
				courseTitle = course.Title
			}
		}
		resp := &CertificateResponse{
			CertificateID: cert.CertificateID,
			UserName:      userName,
			CourseTitle:   courseTitle,
			IssuedAt:      cert.IssuedAt.Format("2006-01-02"),
			DownloadURL:   fmt.Sprintf("/api/v1/certificates/%s/download", cert.CertificateID),
		}
		responses = append(responses, resp)
	}
	return responses, nil
}

func (s *certificateService) FindByCertificateID(certID string) (*Certificate, error) {
	return s.repo.FindByCertificateID(certID)
}
