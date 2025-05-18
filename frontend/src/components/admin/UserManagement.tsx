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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, MoreHorizontal, Edit, UserCog } from "lucide-react";

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    userID: 0,
    username: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    role: "",
  });

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
        users.map((user) =>
          user.userID === userId ? { ...user, role: newRole } : user
        )
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

  const openEditDialog = (user: UserProfileResponse) => {
    setFormData({
      userID: user.userID,
      username: user.username,
      firstName: user.firstName,
      middleName: user.middleName || "",
      lastName: user.lastName,
      email: user.email,
      contactNumber: user.contactNumber,
      role: user.role,
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = async () => {
    try {
      setLoading(true);
      // Validate required fields
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.contactNumber ||
        !formData.username
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      // Find the original user data
      const originalUser = users.find(u => u.userID === formData.userID);
      if (!originalUser) {
        toast.error("User not found");
        return;
      }

      // Only include fields that have changed
      const updatedProfile: Partial<UserProfileResponse> = {};
      
      if (formData.username !== originalUser.username) {
        updatedProfile.username = formData.username;
      }
      if (formData.firstName !== originalUser.firstName) {
        updatedProfile.firstName = formData.firstName;
      }
      if (formData.lastName !== originalUser.lastName) {
        updatedProfile.lastName = formData.lastName;
      }
      if (formData.middleName !== originalUser.middleName) {
        updatedProfile.middleName = formData.middleName || null;
      }
      if (formData.email !== originalUser.email) {
        updatedProfile.email = formData.email;
      }
      if (formData.contactNumber !== originalUser.contactNumber) {
        updatedProfile.contactNumber = formData.contactNumber;
      }
      if (formData.role !== originalUser.role) {
        updatedProfile.role = formData.role;
      }

      // If no fields have changed, show a message and return
      if (Object.keys(updatedProfile).length === 0) {
        toast.info("No changes to save");
        setIsDialogOpen(false);
        return;
      }

      console.log("Sending profile update:", updatedProfile);

      // Update user profile
      await UserAPI.updateProfile(formData.userID, updatedProfile, user?.id);

      // Update local state
      setUsers(
        users.map((u) =>
          u.userID === formData.userID
            ? {
                ...u,
                ...updatedProfile,
              }
            : u
        )
      );

      toast.success("User details updated successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating user details:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update user details: ${errorMessage}`);
    } finally {
      setLoading(false);
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
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                          handleRoleChange(
                            user.userID,
                            user.role === "Administrator" ? "Regular" : "Administrator"
                          )
                        }
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        {user.role === "Administrator"
                          ? "Set as Regular"
                          : "Set as Administrator"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>
              Make changes to the user's details here. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="middleName" className="text-right">
                Middle Name
              </Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) =>
                  setFormData({ ...formData, middleName: e.target.value })
                }
                className="col-span-3"
                placeholder="Optional"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactNumber" className="text-right">
                Contact Number
              </Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="col-span-3 p-2 border rounded-md"
              >
                <option value="Regular">Regular</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditUser} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
