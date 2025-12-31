import EmailConfirmationPage from "@/pages/auth/email-confirmation-page";
import LoginPage from "@/pages/auth/login-page";
import RegisterPage from "@/pages/auth/register-page";
import GuestGuard from "../components/guards/guest-guard";
import { APP_PATHS } from "../constants/app-paths";
import ForgotPasswordPage from "@/pages/auth/forgot-password-page";
import ResetPasswordPage from "@/pages/auth/reset-passord-page";

export const guestRoutes = [
  {
    path: "",
    element: <GuestGuard />,
    children: [
      { path: APP_PATHS.login, element: <LoginPage /> },
      { path: APP_PATHS.register, element: <RegisterPage /> },
      { path: APP_PATHS.emailConfirmation, element: <EmailConfirmationPage /> },
      { path: APP_PATHS.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },
  // Reset password route - outside GuestGuard since Supabase creates a session
  { path: APP_PATHS.resetPassword, element: <ResetPasswordPage /> },
];
