import React, { useState } from "react";
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
import { Loader2, Save } from "lucide-react";

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
  email: z.string().email("Invalid email address"),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 characters"),
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
      email: profile.email,
      contactNumber: profile.contactNumber,
    },
  });

  // Handle form submission
  const onSubmit = async (values: UserFormValues) => {
    if (!isCurrentUser) return;

    setIsSubmitting(true);
    try {
      await UserAPI.updateProfile(profile.userID, values);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Profile Information
          {isCurrentUser && !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              Edit Profile
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Edit your personal information"
            : "Your personal information"}
        </CardDescription>
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
              </div>

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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" type="email" {...field} />
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
                      <Input placeholder="Contact Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Username
                </h3>
                <p className="text-lg">{profile.username}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Role
                </h3>
                <p className="text-lg capitalize">{profile.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  First Name
                </h3>
                <p className="text-lg">{profile.firstName}</p>
              </div>
              {profile.middleName && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Middle Name
                  </h3>
                  <p className="text-lg">{profile.middleName}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Last Name
                </h3>
                <p className="text-lg">{profile.lastName}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Email
              </h3>
              <p className="text-lg">{profile.email}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Contact Number
              </h3>
              <p className="text-lg">{profile.contactNumber}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
