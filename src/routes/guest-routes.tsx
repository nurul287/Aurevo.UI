import { lazy } from "react";
import GuestGuard from "../components/guards/guest-guard";
import { APP_PATHS } from "../constants/app-paths";

const LoginPage = lazy(() => import("@/pages/auth/login-page"));
const RegisterPage = lazy(() => import("@/pages/auth/register-page"));
const EmailConfirmationPage = lazy(() => import("@/pages/auth/email-confirmation-page"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password-page"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-passord-page"));

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
  { path: APP_PATHS.resetPassword, element: <ResetPasswordPage /> },
];
