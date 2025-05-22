/**
 * UserManagement Component
 *
 * Admin component for managing system users:
 * - View all users
 * - Edit user details
 * - Change user roles
 */
import { useState, useEffect } from "react";
import { UserAPI } from "@/lib/api-service";
import { UserProfileResponse } from "@/lib/api-types";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, MoreHorizontal, UserCog, Trash2, Edit } from "lucide-react";
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

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfileResponse | null>(
    null
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await UserAPI.getAll();
        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      setLoading(true);
      // Update the user's role
      await UserAPI.updateProfile(userId, { role: newRole }, user?.id);

      // Update the local state with the new role
      setUsers(
        users.map((u) => (u.userID === userId ? { ...u, role: newRole } : u))
      );

      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(
        `Failed to update user role: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    // Prevent admin from deleting themselves
    if (userToDelete.userID === user?.id) {
      toast.error("You cannot delete your own account.");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      return;
    }

    try {
      setLoading(true);
      await UserAPI.delete(userToDelete.userID, user?.id);

      setUsers(users.filter((u) => u.userID !== userToDelete.userID));
      toast.success(`User ${userToDelete.username} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        `Failed to delete user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading users...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Users ({users.length})</h2>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userID}>
                <TableCell>{user.userID}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  {user.firstName} {user.middleName || ""} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.contactNumber}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs 
                    ${
                      user.role === "Administrator"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                          handleRoleChange(
                            user.userID,
                            user.role === "Administrator"
                              ? "Regular"
                              : "Administrator"
                          )
                        }
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        {user.role === "Administrator"
                          ? "Set as Regular"
                          : "Set as Administrator"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-700/50 dark:hover:!text-red-50"
                        onClick={() => {
                          setUserToDelete(user);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      {userToDelete && (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                user account for "{userToDelete.username}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
