package course

// CreateCourseRequest represents course creation payload
type CreateCourseRequest struct {
	Title        string `json:"title" binding:"required,min=3,max=200"`
	Description  string `json:"description" binding:"required,min=10"`
	ThumbnailURL string `json:"thumbnail_url" binding:"omitempty,url,max=255"`
	Category     string `json:"category" binding:"required,oneof='Web Development' 'Mobile Development' 'Data Science' DevOps"`
	Difficulty   string `json:"difficulty" binding:"required,oneof=beginner intermediate advanced"`
	Price        int    `json:"price" binding:"omitempty,min=0"`
}

// UpdateCourseRequest represents course update payload
type UpdateCourseRequest struct {
	Title        *string `json:"title" binding:"omitempty,min=3,max=200"`
	Description  *string `json:"description" binding:"omitempty,min=10"`
	ThumbnailURL *string `json:"thumbnail_url" binding:"omitempty,url,max=255"`
	Category     *string `json:"category" binding:"omitempty,oneof='Web Development' 'Mobile Development' 'Data Science' DevOps"`
	Difficulty   *string `json:"difficulty" binding:"omitempty,oneof=beginner intermediate advanced"`
	Price        *int    `json:"price" binding:"omitempty,min=0"`
	IsPublished  *bool   `json:"is_published"`
}

// CreateLessonRequest represents lesson creation payload
type CreateLessonRequest struct {
	Title       string `json:"title" binding:"required,min=3,max=200"`
	Content     string `json:"content" binding:"required,min=10"`
	OrderIndex  int    `json:"order_index" binding:"omitempty,min=0"`
	Duration    int    `json:"duration" binding:"omitempty,min=0"`
	IsPublished bool   `json:"is_published" binding:"omitempty"`
}

// UpdateLessonRequest represents lesson update payload
type UpdateLessonRequest struct {
	Title       *string `json:"title" binding:"omitempty,min=3,max=200"`
	Content     *string `json:"content" binding:"omitempty,min=10"`
	OrderIndex  *int    `json:"order_index" binding:"omitempty,min=0"`
	Duration    *int    `json:"duration" binding:"omitempty,min=0"`
	IsPublished *bool   `json:"is_published"`
}

// CourseListQuery represents query parameters for listing courses
type CourseListQuery struct {
	Page         int     `form:"page" binding:"omitempty,min=1"`
	Limit        int     `form:"limit" binding:"omitempty,min=1,max=100"`
	Search       string  `form:"search"`
	Category     string  `form:"category" binding:"omitempty,oneof=programming design business marketing"`
	Difficulty   string  `form:"difficulty" binding:"omitempty,oneof=beginner intermediate advanced"`
	Published    *bool   `form:"published"`
	SortBy       string  `form:"sort_by" binding:"omitempty,oneof=created_at updated_at title price rating popularity enrollment_count"`
	SortOrder    string  `form:"sort_order" binding:"omitempty,oneof=asc desc"`
	MinPrice     float64 `form:"min_price" binding:"omitempty,min=0"`
	MaxPrice     float64 `form:"max_price" binding:"omitempty,min=0"`
	InstructorID uint    `form:"instructor_id" binding:"omitempty,min=1"`
}

// PaginationMeta represents pagination metadata
type PaginationMeta struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// CourseListResponse represents paginated course list response
type CourseListResponse struct {
	Courses    []*CourseResponse `json:"courses"`
	Pagination PaginationMeta    `json:"pagination"`
}

// ReorderLessonsRequest represents payload for reordering lessons
type ReorderLessonsRequest struct {
	Updates []LessonOrderUpdate `json:"updates" binding:"required,min=1,dive"`
}

// LessonOrderUpdate represents a single lesson order update
type LessonOrderUpdate struct {
	LessonID   uint `json:"lesson_id" binding:"required,min=1"`
	OrderIndex int  `json:"order_index" binding:"min=0"`
}
