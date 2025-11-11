package certificate

import (
	"gorm.io/gorm"
)

type CertificateRepository interface {
	Create(cert *Certificate) error
	FindByUserAndCourse(userID, courseID uint) (*Certificate, error)
	FindByUserID(userID uint) ([]*Certificate, error)
	FindByID(id uint) (*Certificate, error)
	FindByCertificateID(certID string) (*Certificate, error)
}

type certificateRepository struct {
	db *gorm.DB
}

func NewCertificateRepository(db *gorm.DB) CertificateRepository {
	return &certificateRepository{db: db}
}

func (r *certificateRepository) Create(cert *Certificate) error {
	return r.db.Create(cert).Error
}

func (r *certificateRepository) FindByUserAndCourse(userID, courseID uint) (*Certificate, error) {
	var cert Certificate
	err := r.db.Where("user_id = ? AND course_id = ?", userID, courseID).First(&cert).Error
	if err != nil {
		return nil, err
	}
	return &cert, nil
}

func (r *certificateRepository) FindByID(id uint) (*Certificate, error) {
	var cert Certificate
	err := r.db.First(&cert, id).Error
	if err != nil {
		return nil, err
	}
	return &cert, nil
}

func (r *certificateRepository) FindByUserID(userID uint) ([]*Certificate, error) {
	var certs []*Certificate
	err := r.db.Where("user_id = ?", userID).Find(&certs).Error
	return certs, err
}

func (r *certificateRepository) FindByCertificateID(certID string) (*Certificate, error) {
	var cert Certificate
	err := r.db.Where("certificate_id = ?", certID).First(&cert).Error
	if err != nil {
		return nil, err
	}
	return &cert, nil
}
