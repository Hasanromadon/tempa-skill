import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  courseName: string;
  isDeleting: boolean;
}

/**
 * DeleteCourseDialog - Confirmation dialog for course deletion
 * 
 * Features:
 * - Clear warning message in Indonesian
 * - Shows course name for context
 * - Disabled state during deletion
 * - Accessible with ARIA labels
 */
export function DeleteCourseDialog({
  open,
  onOpenChange,
  onConfirm,
  courseName,
  isDeleting,
}: DeleteCourseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kursus?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus kursus{" "}
            <strong>&quot;{courseName}&quot;</strong>? Tindakan ini tidak dapat
            dibatalkan dan akan menghapus semua pelajaran yang terkait.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
