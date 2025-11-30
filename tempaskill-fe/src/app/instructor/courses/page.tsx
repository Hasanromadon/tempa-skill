"use client";

import { CourseListPage } from "@/components/course/course-list-page";

/**
 * Instructor Courses List Page
 * Uses reusable CourseListPage component
 */
export default function InstructorCoursesPage() {
  return (
    <CourseListPage
      basePath="/instructor"
      title="Kursus Saya"
      description="Kelola kursus yang Anda buat"
    />
  );
}
