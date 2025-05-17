import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserProfileResponse } from "../../lib/api-types";
import { UserAPI } from "../../lib/api-service";
import { useToast } from "../ui/use-toast";
import { Loader2, Save, Mail, Phone, User as UserIcon, Trash2 } from "lucide-react";

// Interface for component props
interface UserDetailsProps {
  profile: UserProfileResponse;
  setProfile: React.Dispatch<React.SetStateAction<UserProfileResponse | null>>;
  isCurrentUser: boolean;
}

// Form validation schema
const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  contactNumber: z.string()
    .min(10, "Contact number must be at least 10 characters")
    .regex(/^[0-9+\-\s()]*$/, "Invalid phone number format"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserDetails({
  profile,
  setProfile,
  isCurrentUser,
}: UserDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize the form with the user's current data
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      middleName: profile.middleName || "",
      contactNumber: profile.contactNumber,
    },
  });

  // Reset form when editing state changes
  useEffect(() => {
    if (isEditing) {
      form.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        middleName: profile.middleName || "",
        contactNumber: profile.contactNumber,
      });
    }
  }, [isEditing, profile, form]);

  // Handle form submission
  const onSubmit = async (values: UserFormValues) => {
    if (!isCurrentUser) return;
    setIsSubmitting(true);
    try {
      // Only send fields that have changed
      const updateData: Record<string, string> = {};
      if (values.firstName !== profile.firstName) updateData.firstName = values.firstName;
      if (values.lastName !== profile.lastName) updateData.lastName = values.lastName;
      if (values.middleName !== profile.middleName) updateData.middleName = values.middleName || null;
      if (values.contactNumber !== profile.contactNumber) updateData.contactNumber = values.contactNumber;

      await UserAPI.updateProfile(profile.userID, updateData);
      setProfile({ ...profile, ...values });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const profilePictureUrl = "/default-avatar.png";

  return (
    <Card className="max-w-2xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl rounded-3xl p-8">
      <CardHeader className="flex flex-col items-center gap-4 pb-0">
        <div className="relative">
          <img
            src={profilePictureUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-primary object-cover shadow-lg bg-gray-700"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-white mt-2">
          {profile.firstName} {profile.middleName ? profile.middleName + ' ' : ''}{profile.lastName}
        </CardTitle>
        <CardDescription className="text-primary-300 text-sm">
          {profile.role}
        </CardDescription>
        {isCurrentUser && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="default"
            size="sm"
            className="mt-2"
          >
            Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Middle Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Contact Number" 
                          {...field}
                          onChange={(e) => {
                            // Only allow numbers, +, -, spaces, and parentheses
                            const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input value={profile.email} readOnly disabled />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input value={profile.role} readOnly disabled />
                  </FormControl>
                </FormItem>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" />
                <span className="text-gray-400">Username:</span>
                <span className="text-lg text-white">{profile.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-gray-400">Email:</span>
                <span className="text-lg text-white">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-gray-400">Contact:</span>
                <span className="text-lg text-white">{profile.contactNumber}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-gray-400">First Name:</span>
                <span className="text-lg text-white ml-2">{profile.firstName}</span>
              </div>
              {profile.middleName && (
                <div>
                  <span className="text-gray-400">Middle Name:</span>
                  <span className="text-lg text-white ml-2">{profile.middleName}</span>
                </div>
              )}
              <div>
                <span className="text-gray-400">Last Name:</span>
                <span className="text-lg text-white ml-2">{profile.lastName}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
