import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newRole: "student" | "instructor" | "admin") => void;
  userName: string;
  currentRole: string;
  isChanging: boolean;
}

/**
 * ChangeRoleDialog - Dialog for changing user role
 *
 * Features:
 * - Role selection dropdown
 * - Shows current role
 * - Confirmation before change
 * - Indonesian language
 */
export function ChangeRoleDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
  currentRole,
  isChanging,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<
    "student" | "instructor" | "admin"
  >(currentRole as "student" | "instructor" | "admin");

  const roleLabels = {
    student: "Siswa",
    instructor: "Instruktur",
    admin: "Admin",
  };

  const handleConfirm = () => {
    if (selectedRole !== currentRole) {
      onConfirm(selectedRole);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Role Pengguna</DialogTitle>
          <DialogDescription>
            Ubah role untuk <strong>&quot;{userName}&quot;</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">Pilih Role:</label>
          <Select
            value={selectedRole}
            onValueChange={(value) =>
              setSelectedRole(value as "student" | "instructor" | "admin")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Siswa</SelectItem>
              <SelectItem value="instructor">Instruktur</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          {currentRole !== selectedRole && (
            <p className="text-sm text-orange-600 mt-2">
              Role akan diubah dari{" "}
              <strong>
                {roleLabels[currentRole as keyof typeof roleLabels]}
              </strong>{" "}
              ke <strong>{roleLabels[selectedRole]}</strong>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isChanging}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isChanging || selectedRole === currentRole}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isChanging ? "Mengubah..." : "Ubah Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
