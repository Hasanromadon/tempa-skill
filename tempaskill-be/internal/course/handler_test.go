package course

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/config"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/auth"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
)

type CourseHandlerTestSuite struct {
	suite.Suite
	router         *gin.Engine
	db             *gorm.DB
	authMiddleware *middleware.AuthMiddleware
	instructorToken string
	studentToken    string
	instructorID    uint
	studentID       uint
}

func (suite *CourseHandlerTestSuite) SetupSuite() {
	// Load test configuration
	cfg, err := config.LoadConfig()
	suite.NoError(err)

	// Connect to test database
	err = database.ConnectDB(cfg)
	suite.NoError(err)

	suite.db = database.GetDB()

	// Auto-migrate models
	err = suite.db.AutoMigrate(&auth.User{}, &Course{}, &Lesson{}, &Enrollment{})
	suite.NoError(err)

	// Setup Gin router
	gin.SetMode(gin.TestMode)
	suite.router = gin.Default()
	suite.authMiddleware = middleware.NewAuthMiddleware(cfg)

	// Register course routes
	v1 := suite.router.Group("/api/v1")
	RegisterRoutes(v1, suite.db, suite.authMiddleware)

	// Create test users
	suite.createTestUsers(cfg)
}

func (suite *CourseHandlerTestSuite) createTestUsers(cfg *config.Config) {
	// Create instructor user
	instructor := &auth.User{
		Name:     "Test Instructor",
		Email:    "instructor@test.com",
		Password: "$2a$10$YourHashedPasswordHere", // bcrypt hash
		Role:     "instructor",
	}
	result := suite.db.Create(instructor)
	suite.NoError(result.Error)
	suite.instructorID = instructor.ID

	// Create student user
	student := &auth.User{
		Name:     "Test Student",
		Email:    "student@test.com",
		Password: "$2a$10$YourHashedPasswordHere",
		Role:     "student",
	}
	result = suite.db.Create(student)
	suite.NoError(result.Error)
	suite.studentID = student.ID

	// Generate JWT tokens
	suite.instructorToken, _ = suite.authMiddleware.GenerateToken(suite.instructorID, instructor.Email, instructor.Role)
	suite.studentToken, _ = suite.authMiddleware.GenerateToken(suite.studentID, student.Email, student.Role)
}

func (suite *CourseHandlerTestSuite) TearDownSuite() {
	// Clean up test data
	suite.db.Exec("DELETE FROM enrollments")
	suite.db.Exec("DELETE FROM lessons")
	suite.db.Exec("DELETE FROM courses")
	suite.db.Exec("DELETE FROM users")
}

func (suite *CourseHandlerTestSuite) SetupTest() {
	// Clean courses, lessons, enrollments before each test
	suite.db.Exec("DELETE FROM enrollments")
	suite.db.Exec("DELETE FROM lessons")
	suite.db.Exec("DELETE FROM courses")
}

// Test CreateCourse
func (suite *CourseHandlerTestSuite) TestCreateCourse_Success() {
	reqBody := CreateCourseRequest{
		Title:        "Go Programming Masterclass",
		Description:  "Learn Go from scratch",
		ThumbnailURL: "https://example.com/thumb.jpg",
		Category:     "programming",
		Difficulty:   "beginner",
		Price:        99000,
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/v1/courses", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+suite.instructorToken)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(suite.T(), "Course created successfully", response["message"])
	assert.NotNil(suite.T(), response["data"])

	data := response["data"].(map[string]interface{})
	assert.Equal(suite.T(), "Go Programming Masterclass", data["title"])
	assert.Equal(suite.T(), "go-programming-masterclass", data["slug"])
	assert.Equal(suite.T(), float64(suite.instructorID), data["instructor_id"])
	assert.Equal(suite.T(), false, data["is_published"])
}

func (suite *CourseHandlerTestSuite) TestCreateCourse_Unauthorized() {
	reqBody := CreateCourseRequest{
		Title:      "Test Course",
		Category:   "programming",
		Difficulty: "beginner",
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/v1/courses", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusUnauthorized, w.Code)
}

func (suite *CourseHandlerTestSuite) TestCreateCourse_ValidationError() {
	reqBody := CreateCourseRequest{
		Title: "", // Empty title should fail validation
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/v1/courses", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+suite.instructorToken)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)
}

// Test ListCourses
func (suite *CourseHandlerTestSuite) TestListCourses_Success() {
	// Create test courses
	courses := []Course{
		{
			Title:        "Course 1",
			Slug:         "course-1",
			Category:     "programming",
			Difficulty:   "beginner",
			InstructorID: suite.instructorID,
			IsPublished:  true,
		},
		{
			Title:        "Course 2",
			Slug:         "course-2",
			Category:     "design",
			Difficulty:   "intermediate",
			InstructorID: suite.instructorID,
			IsPublished:  true,
		},
		{
			Title:        "Unpublished Course",
			Slug:         "unpublished-course",
			Category:     "programming",
			Difficulty:   "advanced",
			InstructorID: suite.instructorID,
			IsPublished:  false,
		},
	}

	for _, course := range courses {
		suite.db.Create(&course)
	}

	req, _ := http.NewRequest("GET", "/api/v1/courses?page=1&limit=10", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data := response["data"].(map[string]interface{})
	courses_list := data["courses"].([]interface{})
	
	// Should return 2 published courses (unpublished excluded for public)
	assert.Equal(suite.T(), 2, len(courses_list))
}

func (suite *CourseHandlerTestSuite) TestListCourses_WithFilters() {
	// Create test courses
	suite.db.Create(&Course{
		Title:        "Go Advanced",
		Slug:         "go-advanced",
		Category:     "programming",
		Difficulty:   "advanced",
		InstructorID: suite.instructorID,
		IsPublished:  true,
	})

	req, _ := http.NewRequest("GET", "/api/v1/courses?category=programming&difficulty=advanced", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data := response["data"].(map[string]interface{})
	courses := data["courses"].([]interface{})
	assert.Equal(suite.T(), 1, len(courses))

	course := courses[0].(map[string]interface{})
	assert.Equal(suite.T(), "Go Advanced", course["title"])
}

func (suite *CourseHandlerTestSuite) TestListCourses_WithSearch() {
	// Create test courses
	suite.db.Create(&Course{
		Title:        "JavaScript Basics",
		Slug:         "javascript-basics",
		Description:  "Learn JavaScript from scratch",
		Category:     "programming",
		Difficulty:   "beginner",
		InstructorID: suite.instructorID,
		IsPublished:  true,
	})

	req, _ := http.NewRequest("GET", "/api/v1/courses?search=javascript", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data := response["data"].(map[string]interface{})
	courses := data["courses"].([]interface{})
	assert.GreaterOrEqual(suite.T(), len(courses), 1)
}

// Test GetCourse
func (suite *CourseHandlerTestSuite) TestGetCourse_Success() {
	course := &Course{
		Title:        "Test Course",
		Slug:         "test-course",
		Category:     "programming",
		Difficulty:   "beginner",
		InstructorID: suite.instructorID,
		IsPublished:  true,
	}
	suite.db.Create(course)

	// Create lessons for this course
	suite.db.Create(&Lesson{
		CourseID:    course.ID,
		Title:       "Lesson 1",
		Slug:        "lesson-1",
		OrderIndex:  1,
		IsPublished: true,
	})

	req, _ := http.NewRequest("GET", "/api/v1/courses/"+fmt.Sprintf("%d", course.ID), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data := response["data"].(map[string]interface{})
	assert.Equal(suite.T(), "Test Course", data["title"])
	assert.Equal(suite.T(), float64(1), data["lesson_count"])
}

func (suite *CourseHandlerTestSuite) TestGetCourse_NotFound() {
	req, _ := http.NewRequest("GET", "/api/v1/courses/99999", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusNotFound, w.Code)
}

// Test UpdateCourse
func (suite *CourseHandlerTestSuite) TestUpdateCourse_Success() {
	course := &Course{
		Title:        "Original Title",
		Slug:         "original-title",
		Category:     "programming",
		Difficulty:   "beginner",
		InstructorID: suite.instructorID,
		IsPublished:  false,
	}
	suite.db.Create(course)

	newTitle := "Updated Title"
	isPublished := true
	reqBody := UpdateCourseRequest{
		Title:       &newTitle,
		IsPublished: &isPublished,
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("PATCH", "/api/v1/courses/"+fmt.Sprintf("%d", course.ID), bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+suite.instructorToken)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	data := response["data"].(map[string]interface{})
	assert.Equal(suite.T(), "Updated Title", data["title"])
	assert.Equal(suite.T(), true, data["is_published"])
}

func (suite *CourseHandlerTestSuite) TestUpdateCourse_Forbidden() {
	course := &Course{
		Title:        "Test Course",
		Slug:         "test-course",
		Category:     "programming",
		Difficulty:   "beginner",
		InstructorID: suite.instructorID,
		IsPublished:  false,
	}
	suite.db.Create(course)

	newTitle := "Hacked Title"
	reqBody := UpdateCourseRequest{
		Title: &newTitle,
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("PATCH", "/api/v1/courses/"+fmt.Sprintf("%d", course.ID), bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+suite.studentToken) // Different user

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusForbidden, w.Code)
}

// Test DeleteCourse
func (suite *CourseHandlerTestSuite) TestDeleteCourse_Success() {
	course := &Course{
		Title:        "Course to Delete",
		Slug:         "course-to-delete",
		Category:     "programming",
		Difficulty:   "beginner",
		InstructorID: suite.instructorID,
	}
	suite.db.Create(course)

	req, _ := http.NewRequest("DELETE", "/api/v1/courses/"+fmt.Sprintf("%d", course.ID), nil)
	req.Header.Set("Authorization", "Bearer "+suite.instructorToken)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	// Verify course is deleted (soft delete)
	var deletedCourse Course
	result := suite.db.Unscoped().First(&deletedCourse, course.ID)
	assert.NoError(suite.T(), result.Error)
	assert.NotNil(suite.T(), deletedCourse.DeletedAt)
}

// Test EnrollCourse
func (suite *CourseHandlerTestSuite) TestEnrollCourse_Success() {
	course := &Course{
		Title:        "Course to Enroll",
		Slug:         "course-to-enroll",
		Category:     "programming",
		Difficulty:   "beginner",
		InstructorID: suite.instructorID,
		IsPublished:  true, // Must be published to enroll
	}
	suite.db.Create(course)

	req, _ := http.NewRequest("POST", "/api/v1/courses/"+fmt.Sprintf("%d", course.ID)+"/enroll", nil)
	req.Header.Set("Authorization", "Bearer "+suite.studentToken)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(suite.T(), "Successfully enrolled in course", response["message"])

	// Verify enrollment created
	var enrollment Enrollment
	result := suite.db.Where("user_id = ? AND course_id = ?", suite.studentID, course.ID).First(&enrollment)
	assert.NoError(suite.T(), result.Error)
}

func (suite *CourseHandlerTestSuite) TestEnrollCourse_NotPublished() {
	course := &Course{
		Title:        "Unpublished Course",
		Slug:         "unpublished-course",
		Category:     "programming",
		Difficulty:   "beginner",
		InstructorID: suite.instructorID,
		IsPublished:  false, // Not published
	}
	suite.db.Create(course)

	req, _ := http.NewRequest("POST", "/api/v1/courses/"+fmt.Sprintf("%d", course.ID)+"/enroll", nil)
	req.Header.Set("Authorization", "Bearer "+suite.studentToken)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)
}

func (suite *CourseHandlerTestSuite) TestEnrollCourse_AlreadyEnrolled() {
	course := &Course{
		Title:        "Course",
		Slug:         "course",
		Category:     "programming",
		Difficulty:   "beginner",
		InstructorID: suite.instructorID,
		IsPublished:  true,
	}
	suite.db.Create(course)

	// Create enrollment
	suite.db.Create(&Enrollment{
		UserID:     suite.studentID,
		CourseID:   course.ID,
		Progress:   0,
		EnrolledAt: time.Now(),
	})

	req, _ := http.NewRequest("POST", "/api/v1/courses/"+fmt.Sprintf("%d", course.ID)+"/enroll", nil)
	req.Header.Set("Authorization", "Bearer "+suite.studentToken)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusConflict, w.Code)
}

// Test UnenrollCourse
func (suite *CourseHandlerTestSuite) TestUnenrollCourse_Success() {
	course := &Course{
		Title:         "Course",
		Slug:          "course",
		Category:      "programming",
		Difficulty:    "beginner",
		InstructorID:  suite.instructorID,
		IsPublished:   true,
		EnrolledCount: 1,
	}
	suite.db.Create(course)

	// Create enrollment
	suite.db.Create(&Enrollment{
		UserID:     suite.studentID,
		CourseID:   course.ID,
		Progress:   50,
		EnrolledAt: time.Now(),
	})

	req, _ := http.NewRequest("DELETE", "/api/v1/courses/"+fmt.Sprintf("%d", course.ID)+"/enroll", nil)
	req.Header.Set("Authorization", "Bearer "+suite.studentToken)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	// Verify enrollment deleted
	var enrollment Enrollment
	result := suite.db.Where("user_id = ? AND course_id = ?", suite.studentID, course.ID).First(&enrollment)
	assert.Error(suite.T(), result.Error) // Should not exist
}

func (suite *CourseHandlerTestSuite) TestUnenrollCourse_NotEnrolled() {
	course := &Course{
		Title:        "Course",
		Slug:         "course",
		Category:     "programming",
		Difficulty:   "beginner",
		InstructorID: suite.instructorID,
		IsPublished:  true,
	}
	suite.db.Create(course)

	req, _ := http.NewRequest("DELETE", "/api/v1/courses/"+fmt.Sprintf("%d", course.ID)+"/enroll", nil)
	req.Header.Set("Authorization", "Bearer "+suite.studentToken)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)
}

// Test Lesson endpoints
func (suite *CourseHandlerTestSuite) TestCreateLesson_Success() {
	course := &Course{
		Title:        "Course",
		Slug:         "course",
		Category:     "programming",
		Difficulty:   "beginner",
		InstructorID: suite.instructorID,
	}
	suite.db.Create(course)

	reqBody := CreateLessonRequest{
		Title:      "Introduction to Go",
		Content:    "# Introduction\n\nWelcome to Go programming!",
		OrderIndex: 1,
		Duration:   600, // 10 minutes
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/v1/courses/"+fmt.Sprintf("%d", course.ID)+"/lessons", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+suite.instructorToken)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(suite.T(), "Lesson created successfully", response["message"])
}

func (suite *CourseHandlerTestSuite) TestCreateLesson_Forbidden() {
	course := &Course{
		Title:        "Course",
		Slug:         "course",
		Category:     "programming",
		Difficulty:   "beginner",
		InstructorID: suite.instructorID,
	}
	suite.db.Create(course)

	reqBody := CreateLessonRequest{
		Title:      "Hacked Lesson",
		OrderIndex: 1,
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/v1/courses/"+fmt.Sprintf("%d", course.ID)+"/lessons", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+suite.studentToken) // Not the instructor

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusForbidden, w.Code)
}

func TestCourseHandlerTestSuite(t *testing.T) {
	suite.Run(t, new(CourseHandlerTestSuite))
}
