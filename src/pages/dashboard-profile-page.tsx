import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_PATHS } from "@/constants/app-paths";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateUserProfile,
  useUpdateProfile,
  useUserProfile,
} from "@/services";
import type { UserGender } from "@/services/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

function toDateInputValue(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const DashboardProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const userId = user?.id ?? "";

  const { data: profile, isLoading } = useUserProfile(userId);
  const updateProfile = useUpdateProfile();
  const createProfile = useCreateUserProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<UserGender | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name ?? "");
    setLastName(profile.last_name ?? "");
    setPhone(profile.phone ?? "");
    setGender((profile.gender as UserGender | undefined) ?? "");
    setDateOfBirth(toDateInputValue(profile.date_of_birth));
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const updates = {
      first_name: firstName.trim() || undefined,
      last_name: lastName.trim() || undefined,
      phone: phone.trim() || undefined,
      gender: (gender || undefined) as UserGender | undefined,
      date_of_birth: dateOfBirth || undefined,
    };

    try {
      if (profile) {
        await updateProfile.mutateAsync({ userId, updates });
      } else {
        await createProfile.mutateAsync({
          userId,
          profileData: {
            first_name: firstName.trim() || undefined,
            last_name: lastName.trim() || undefined,
            phone: phone.trim() || undefined,
            gender: (gender || undefined) as UserGender | undefined,
            date_of_birth: dateOfBirth || undefined,
          },
        });
      }
      showSuccess("Profile saved", "Your personal information has been updated.");
      navigate(APP_PATHS.dashboard);
    } catch (err) {
      console.error(err);
      showError(
        "Could not save profile",
        err instanceof Error ? err.message : "Please try again.",
      );
    }
  };

  const pending = updateProfile.isPending || createProfile.isPending;

  if (!userId) {
    return (
      <div className="min-h-screen py-16 text-center text-muted-foreground">
        {t("profile.signInPrompt")}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10">
      <div className="container-custom max-w-2xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={APP_PATHS.home}>{t("profile.home")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={APP_PATHS.dashboard}>{t("nav.dashboard")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("profile.editProfile")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b bg-card">
            <CardTitle className="text-xl">{t("profile.title")}</CardTitle>
            <CardDescription>{t("profile.description")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("profile.firstName")}</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    placeholder={t("profile.firstName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    placeholder={t("profile.lastName")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("profile.email")}</Label>
                <Input value={user?.email ?? ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  {t("profile.emailNote")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("profile.phone")}</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder={t("profile.phonePlaceholder")}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("profile.gender")}</Label>
                  <Select
                    value={gender || undefined}
                    onValueChange={(v) => setGender(v as UserGender)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("profile.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("profile.male")}</SelectItem>
                      <SelectItem value="female">{t("profile.female")}</SelectItem>
                      <SelectItem value="other">{t("profile.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">{t("profile.dateOfBirth")}</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" asChild>
                  <Link to={APP_PATHS.dashboard}>{t("profile.cancel")}</Link>
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  )}
                  {t("profile.saveChanges")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardProfilePage;
