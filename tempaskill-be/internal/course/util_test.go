package course

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestGenerateSlug tests the slug generation utility
func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"Simple text", "Hello World", "hello-world"},
		{"With numbers", "Go Programming 101", "go-programming-101"},
		{"With special chars", "Introduction to AI/ML", "introduction-to-ai-ml"},
		{"With plus", "Advanced C++", "advanced-c"},
		{"With spaces", "   Spaces   ", "spaces"},
		{"Multiple dashes", "Multiple---Dashes", "multiple-dashes"},
		{"Underscores", "Some_Under_Scores", "some-under-scores"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := generateSlug(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}
