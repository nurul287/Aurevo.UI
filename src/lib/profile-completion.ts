import type { UserProfile } from "@/services/types";

export type ProfileSegment = {
  id: "name" | "phone" | "gender" | "dob";
  label: string;
  done: boolean;
};

export function getProfileCompletion(
  profile: UserProfile | null | undefined,
): {
  percent: number;
  headline: string;
  detail: string;
  segments: ProfileSegment[];
} {
  const hasName = !!(
    profile?.first_name?.trim() && profile?.last_name?.trim()
  );
  const hasPhone = !!profile?.phone?.trim();
  const hasGender = !!profile?.gender;
  const hasDob = !!profile?.date_of_birth;

  const segments: ProfileSegment[] = [
    { id: "name", label: "Full name", done: hasName },
    { id: "phone", label: "Phone", done: hasPhone },
    { id: "gender", label: "Gender", done: hasGender },
    { id: "dob", label: "Date of birth", done: hasDob },
  ];

  const done = segments.filter((s) => s.done).length;
  const total = segments.length;
  const percent = Math.round((done / total) * 100);

  let headline: string;
  let detail: string;
  if (!profile) {
    headline = "Not started";
    detail = "Create your profile to track orders and checkout faster.";
  } else if (percent >= 100) {
    headline = "Complete";
    detail = "Your profile has the details we need.";
  } else if (percent >= 50) {
    headline = "Almost there";
    detail = `${total - done} detail${total - done === 1 ? "" : "s"} left to finish your profile.`;
  } else {
    headline = "Incomplete";
    detail = "Add your details for a smoother shopping experience.";
  }

  return { percent, headline, detail, segments };
}
