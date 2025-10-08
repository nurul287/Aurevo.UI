import EmailConfirmationPage from "@/pages/auth/email-confirmation-page";
import LoginPage from "@/pages/auth/login-page";
import RegisterPage from "@/pages/auth/register-page";
import GuestGuard from "../components/guards/guest-guard";
import { APP_PATHS } from "../constants/app-paths";

export const guestRoutes = [
  {
    path: "",
    element: <GuestGuard />,
    children: [
      { path: APP_PATHS.login, element: <LoginPage /> },
      { path: APP_PATHS.register, element: <RegisterPage /> },
      { path: APP_PATHS.emailConfirmation, element: <EmailConfirmationPage /> },
    ],
  },
];
