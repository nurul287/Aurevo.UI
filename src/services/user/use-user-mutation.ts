import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { authQueryKeys } from "@/services/auth/use-auth-query";
import { UserProfile } from "@/services/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId: _userId,
      updates,
    }: {
      userId: string;
      updates: Partial<UserProfile>;
    }) => {
      return api.patch<UserProfile>("/auth/profile", {
        firstName: updates.first_name,
        lastName: updates.last_name,
        phone: updates.phone,
        avatarUrl: updates.avatar_url,
        dateOfBirth: updates.date_of_birth,
        gender: updates.gender,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(authQueryKeys.userProfile(variables.userId), data);
    },
    onError: (error: Error) => {
      console.error("Update profile error:", error);
    },
  });
}

export function useCreateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId: _userId,
      profileData,
    }: {
      userId: string;
      profileData: Partial<UserProfile>;
    }) => {
      return api.patch<UserProfile>("/auth/profile", {
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        phone: profileData.phone,
        avatarUrl: profileData.avatar_url,
        dateOfBirth: profileData.date_of_birth,
        gender: profileData.gender,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(authQueryKeys.userProfile(variables.userId), data);
    },
    onError: (error: Error) => {
      console.error("Create profile error:", error);
    },
  });
}

// Avatar upload stays on Supabase Storage — the BE doesn't host file uploads
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Record the new avatar URL via BE
      await api.patch("/auth/profile", { avatarUrl: publicUrl });

      return publicUrl;
    },
    onSuccess: (avatarUrl, variables) => {
      queryClient.setQueryData(
        authQueryKeys.userProfile(variables.userId),
        (oldData: UserProfile | null | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, avatar_url: avatarUrl };
        }
      );
    },
    onError: (error: Error) => {
      console.error("Upload avatar error:", error);
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId: _userId,
      avatarUrl,
    }: {
      userId: string;
      avatarUrl: string;
    }) => {
      const urlParts = avatarUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      const { error } = await supabase.storage.from("avatars").remove([filePath]);
      if (error) throw error;

      await api.patch("/auth/profile", { avatarUrl: null });
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        authQueryKeys.userProfile(variables.userId),
        (oldData: UserProfile | null | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, avatar_url: null };
        }
      );
    },
    onError: (error: Error) => {
      console.error("Delete avatar error:", error);
    },
  });
}

export function useUserMutations() {
  const updateProfile = useUpdateUserProfile();
  const createProfile = useCreateUserProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  return { updateProfile, createProfile, uploadAvatar, deleteAvatar };
}
