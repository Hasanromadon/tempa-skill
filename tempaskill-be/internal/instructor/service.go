package instructor

import (
	"context"
)

type Service interface {
	GetMyStudents(ctx context.Context, instructorID uint, query *StudentListQuery) (*InstructorStudentListResult, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetMyStudents(ctx context.Context, instructorID uint, query *StudentListQuery) (*InstructorStudentListResult, error) {
	// Set defaults
	if query.Page == 0 {
		query.Page = 1
	}
	if query.Limit == 0 {
		query.Limit = 10
	}

	students, total, err := s.repo.GetMyStudents(ctx, instructorID, query)
	if err != nil {
		return nil, err
	}

	totalPages := int(total) / query.Limit
	if int(total)%query.Limit > 0 {
		totalPages++
	}

	return &InstructorStudentListResult{
		Students:   students,
		Total:      total,
		Page:       query.Page,
		Limit:      query.Limit,
		TotalPages: totalPages,
	}, nil
}
