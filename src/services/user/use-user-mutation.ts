import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/services/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userQueryKeys } from "./use-user-query";

/**
 * Hook for updating user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<UserProfile>;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Update profile cache
      queryClient.setQueryData(userQueryKeys.profile(variables.userId), data);
    },
    onError: (error) => {
      console.error("Update profile error:", error);
    },
  });
}

/**
 * Hook for creating user profile
 */
export function useCreateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      profileData,
    }: {
      userId: string;
      profileData: Partial<UserProfile>;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Update profile cache
      queryClient.setQueryData(userQueryKeys.profile(variables.userId), data);
    },
    onError: (error) => {
      console.error("Create profile error:", error);
    },
  });
}

/**
 * Hook for uploading user avatar
 */
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

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      return publicUrl;
    },
    onSuccess: (avatarUrl, variables) => {
      // Update profile cache with new avatar URL
      queryClient.setQueryData(
        userQueryKeys.profile(variables.userId),
        (oldData: UserProfile | null | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, avatar_url: avatarUrl };
        }
      );
    },
    onError: (error) => {
      console.error("Upload avatar error:", error);
    },
  });
}

/**
 * Hook for deleting user avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      avatarUrl,
    }: {
      userId: string;
      avatarUrl: string;
    }) => {
      // Extract file path from URL
      const urlParts = avatarUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      const { error } = await supabase.storage
        .from("avatars")
        .remove([filePath]);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Update profile cache to remove avatar URL
      queryClient.setQueryData(
        userQueryKeys.profile(variables.userId),
        (oldData: UserProfile | null | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, avatar_url: null };
        }
      );
    },
    onError: (error) => {
      console.error("Delete avatar error:", error);
    },
  });
}

/**
 * Combined hook for all user mutations
 */
export function useUserMutations() {
  const updateProfile = useUpdateUserProfile();
  const createProfile = useCreateUserProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  return {
    updateProfile,
    createProfile,
    uploadAvatar,
    deleteAvatar,
  };
}
