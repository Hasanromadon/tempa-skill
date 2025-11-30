"use client";

import { CourseListPage } from "@/components/course/course-list-page";

/**
 * Admin Courses List Page
 * Uses reusable CourseListPage component
 */
export default function AdminCoursesPage() {
  return (
    <CourseListPage
      basePath="/admin"
      title="Kelola Kursus"
      description="Kelola semua kursus di platform TempaSKill"
    />
  );
}
