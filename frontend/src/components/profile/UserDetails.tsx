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
import {
  Loader2,
  Save,
  Mail,
  Phone,
  User as UserIcon,
  Trash2,
} from "lucide-react";
import { UserAvatar } from "../UserAvatar";

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
    },
  });

  // Reset form when editing state changes
  useEffect(() => {
    if (isEditing) {
      form.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        middleName: profile.middleName || "",
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
      if (values.firstName !== profile.firstName)
        updateData.firstName = values.firstName;
      if (values.lastName !== profile.lastName)
        updateData.lastName = values.lastName;
      if (values.middleName !== profile.middleName)
        updateData.middleName = values.middleName || null;

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

  return (
    <Card className="max-w-2xl mx-auto dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-white dark:shadow-2xl shadow-lg rounded-3xl p-8 border dark:border-gray-700/50 border-gray-200">
      <CardHeader className="flex flex-col items-center gap-4 pb-0">
        <div className="relative">
          <UserAvatar
            firstName={profile.firstName}
            lastName={profile.lastName}
            size="xl"
            className="shadow-lg"
          />
        </div>
        <CardTitle className="text-2xl font-bold dark:text-white text-gray-900 mt-2">
          {profile.firstName}{" "}
          {profile.middleName ? profile.middleName + " " : ""}
          {profile.lastName}
        </CardTitle>
        <CardDescription className="dark:text-primary-300 text-primary-500 text-sm">
          {profile.role}
        </CardDescription>
        {isCurrentUser && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="default"
            size="sm"
            className="mt-2 dark:bg-blue-600 dark:hover:bg-blue-700 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent className="dark:text-gray-100 text-gray-900">
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300 text-gray-700">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First Name"
                          {...field}
                          className="dark:bg-gray-800 bg-white dark:text-gray-100 text-gray-900 dark:border-gray-600 border-gray-300"
                        />
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
                      <FormLabel className="dark:text-gray-300 text-gray-700">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last Name"
                          {...field}
                          className="dark:bg-gray-800 bg-white dark:text-gray-100 text-gray-900 dark:border-gray-600 border-gray-300"
                        />
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
                      <FormLabel className="dark:text-gray-300 text-gray-700">
                        Middle Name (optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Middle Name"
                          {...field}
                          className="dark:bg-gray-800 bg-white dark:text-gray-100 text-gray-900 dark:border-gray-600 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel className="dark:text-gray-300 text-gray-700">
                    Contact Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={profile.contactNumber}
                      readOnly
                      disabled
                      className="dark:bg-gray-700/50 bg-gray-100/50 dark:text-gray-400 text-gray-500 dark:border-gray-600 border-gray-300"
                    />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel className="dark:text-gray-300 text-gray-700">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={profile.email}
                      readOnly
                      disabled
                      className="dark:bg-gray-700/50 bg-gray-100/50 dark:text-gray-400 text-gray-500 dark:border-gray-600 border-gray-300"
                    />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel className="dark:text-gray-300 text-gray-700">
                    Role
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={profile.role}
                      readOnly
                      disabled
                      className="dark:bg-gray-700/50 bg-gray-100/50 dark:text-gray-400 text-gray-500 dark:border-gray-600 border-gray-300"
                    />
                  </FormControl>
                </FormItem>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="dark:border-gray-600 border-gray-300 dark:text-gray-300 text-gray-700 dark:hover:bg-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="dark:bg-green-600 dark:hover:bg-green-700 bg-green-500 hover:bg-green-600 text-white"
                >
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
                <span className="dark:text-gray-400 text-gray-600">
                  Username:
                </span>
                <span className="text-lg dark:text-white text-gray-900">
                  {profile.username}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="dark:text-gray-400 text-gray-600">Email:</span>
                <span className="text-lg dark:text-white text-gray-900">
                  {profile.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="dark:text-gray-400 text-gray-600">
                  Contact:
                </span>
                <span className="text-lg dark:text-white text-gray-900">
                  {profile.contactNumber}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="dark:text-gray-400 text-gray-600">
                  First Name:
                </span>
                <span className="text-lg dark:text-white text-gray-900 ml-2">
                  {profile.firstName}
                </span>
              </div>
              {profile.middleName && (
                <div>
                  <span className="dark:text-gray-400 text-gray-600">
                    Middle Name:
                  </span>
                  <span className="text-lg dark:text-white text-gray-900 ml-2">
                    {profile.middleName}
                  </span>
                </div>
              )}
              <div>
                <span className="dark:text-gray-400 text-gray-600">
                  Last Name:
                </span>
                <span className="text-lg dark:text-white text-gray-900 ml-2">
                  {profile.lastName}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
