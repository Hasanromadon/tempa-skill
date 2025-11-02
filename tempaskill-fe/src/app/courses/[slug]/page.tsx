"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useCourse,
  useCourseLessons,
  useEnrollCourse,
  useUnenrollCourse,
  useIsAuthenticated,
  useCourseProgress,
  useUser,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Clock,
  Users,
  CheckCircle2,
  Lock,
  ArrowLeft,
  User,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function CourseDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = params;
  const { isAuthenticated } = useIsAuthenticated();
  const { data: course, isLoading, error } = useCourse(slug);
  const { data: lessons, isLoading: lessonsLoading } = useCourseLessons(
    course?.id || 0
  );
  const { data: progress } = useCourseProgress(course?.id || 0);
  const { data: instructor } = useUser(course?.instructor_id || 0);
  const enrollCourse = useEnrollCourse();
  const unenrollCourse = useUnenrollCourse();
  const [enrollError, setEnrollError] = useState("");

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!course) return;

    setEnrollError("");
    try {
      await enrollCourse.mutateAsync(course.id);
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message ||
        "Failed to enroll. Please try again.";
      setEnrollError(errorMessage);
    }
  };

  const handleUnenroll = async () => {
    if (!course) return;

    try {
      await unenrollCourse.mutateAsync(course.id);
    } catch (err) {
      console.error("Unenroll failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Course Not Found</CardTitle>
            <CardDescription>
              The course you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/courses">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/courses"
            className="inline-flex items-center text-orange-100 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-white/20 text-white border-white/30"
                >
                  {course.category}
                </Badge>
                {course.is_enrolled && (
                  <Badge className="bg-green-500 text-white">Enrolled</Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-orange-100 mb-6 max-w-3xl">
                {course.description}
              </p>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{course.lesson_count} Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.enrolled_count} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-2xl font-bold">
                    {formatPrice(course.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Section (if enrolled) */}
            {course.is_enrolled && progress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {progress.completed_lessons} of {progress.total_lessons}{" "}
                        lessons completed
                      </span>
                      <span className="text-sm font-medium">
                        {progress.progress_percentage}%
                      </span>
                    </div>
                    <Progress value={progress.progress_percentage} />
                  </div>
                  {progress.is_completed && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Congratulations! You&apos;ve completed this course!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>What you&apos;ll learn</h3>
                <ul>
                  <li>
                    Master the fundamentals through comprehensive text-based
                    materials
                  </li>
                  <li>Participate in bi-weekly live Q&A and coding sessions</li>
                  <li>
                    Build real-world projects and gain practical experience
                  </li>
                  <li>
                    Get personalized feedback from experienced instructors
                  </li>
                </ul>

                <h3>Course Format</h3>
                <p>
                  This course uses TempaSKill&apos;s unique hybrid learning
                  approach:
                </p>
                <ul>
                  <li>
                    <strong>Text-Based Lessons:</strong> Read and learn at your
                    own pace
                  </li>
                  <li>
                    <strong>Live Sessions:</strong> Join interactive sessions
                    every 2 weeks
                  </li>
                  <li>
                    <strong>Progress Tracking:</strong> Monitor your advancement
                    through the course
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {course.lesson_count} lessons in this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lessonsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : lessons && lessons.length > 0 ? (
                  <div className="space-y-2">
                    {lessons.map((lesson, index) => {
                      const isCompleted =
                        progress?.completed_lesson_ids.includes(lesson.id);
                      const canAccess = course.is_enrolled;

                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            canAccess
                              ? "hover:bg-gray-50 cursor-pointer"
                              : "bg-gray-50"
                          }`}
                          onClick={() => {
                            if (canAccess) {
                              router.push(
                                `/courses/${slug}/lessons/${lesson.id}`
                              );
                            }
                          }}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                isCompleted
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration} min
                                </span>
                                {isCompleted && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    Completed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {!canAccess && (
                            <Lock className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No lessons available yet. Check back soon!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Instructor */}
            {instructor && (
              <Card>
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {instructor.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {instructor.role}
                      </p>
                      {instructor.bio && (
                        <p className="mt-2 text-gray-700">{instructor.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Enrollment Card */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <div className="text-3xl font-bold text-orange-600">
                  {formatPrice(course.price)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrollError && (
                  <Alert variant="destructive">
                    <AlertDescription>{enrollError}</AlertDescription>
                  </Alert>
                )}

                {!course.is_enrolled ? (
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrollCourse.isPending}
                  >
                    {enrollCourse.isPending
                      ? "Enrolling..."
                      : course.price === 0
                      ? "Enroll for Free"
                      : "Enroll Now"}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      size="lg"
                      onClick={() => {
                        if (lessons && lessons.length > 0) {
                          const nextLesson =
                            lessons.find(
                              (l) =>
                                !progress?.completed_lesson_ids.includes(l.id)
                            ) || lessons[0];
                          router.push(
                            `/courses/${slug}/lessons/${nextLesson.id}`
                          );
                        }
                      }}
                    >
                      {progress && progress.completed_lessons > 0
                        ? "Continue Learning"
                        : "Start Learning"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                      onClick={handleUnenroll}
                      disabled={unenrollCourse.isPending}
                    >
                      {unenrollCourse.isPending ? "Unenrolling..." : "Unenroll"}
                    </Button>
                  </div>
                )}

                <div className="border-t pt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Lessons</span>
                    <span className="font-medium">{course.lesson_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Students</span>
                    <span className="font-medium">{course.enrolled_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Difficulty</span>
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium capitalize">
                      {course.category}
                    </span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      <Link
                        href="/login"
                        className="text-blue-600 hover:underline"
                      >
                        Sign in
                      </Link>{" "}
                      or{" "}
                      <Link
                        href="/register"
                        className="text-blue-600 hover:underline"
                      >
                        create an account
                      </Link>{" "}
                      to enroll
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
