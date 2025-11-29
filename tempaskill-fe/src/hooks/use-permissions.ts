import { useCurrentUser } from "./use-auth";

/**
 * Hook to check course permissions for current user
 *
 * @param instructorId - The instructor ID of the course
 * @returns Permission flags (canEdit, canDelete, isOwner, isAdmin)
 */
export const useCoursePermissions = (instructorId?: number) => {
  const { data: user, isLoading } = useCurrentUser();

  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";
  const isOwner = instructorId ? user?.id === instructorId : false;

  return {
    // Can edit if admin OR owner
    canEdit: isAdmin || isOwner,
    // Can delete if admin OR owner
    canDelete: isAdmin || isOwner,
    // Is the course owner
    isOwner,
    // Is admin (full access)
    isAdmin,
    // Is instructor role (not necessarily owner)
    isInstructor,
    // Loading state
    isLoading,
    // Current user
    user,
  };
};

/**
 * Hook to check if user can create courses
 */
export const useCanCreateCourse = () => {
  const { data: user, isLoading } = useCurrentUser();

  const canCreate = user?.role === "admin" || user?.role === "instructor";

  return {
    canCreate,
    isLoading,
    user,
  };
};

/**
 * Hook to check lesson permissions
 * Lesson permissions inherit from course permissions
 *
 * @param courseInstructorId - The instructor ID of the parent course
 */
export const useLessonPermissions = (courseInstructorId?: number) => {
  return useCoursePermissions(courseInstructorId);
};

/**
 * Hook to check session permissions
 *
 * @param sessionInstructorId - The instructor ID of the session
 */
export const useSessionPermissions = (sessionInstructorId?: number) => {
  const { data: user, isLoading } = useCurrentUser();

  const isAdmin = user?.role === "admin";
  const isOwner = sessionInstructorId
    ? user?.id === sessionInstructorId
    : false;

  return {
    canEdit: isAdmin || isOwner,
    canDelete: isAdmin || isOwner,
    canManageParticipants: isAdmin || isOwner,
    canMarkAttendance: isAdmin || isOwner,
    isOwner,
    isAdmin,
    isLoading,
    user,
  };
};
