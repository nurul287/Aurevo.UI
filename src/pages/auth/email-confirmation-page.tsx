import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const EmailConfirmationPage = () => {
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const { resendConfirmation } = useAuth();

  const handleResendConfirmation = async () => {
    setResending(true);
    setResendSuccess(false);
    setResendError(null);

    // Get email from URL params or localStorage
    const email =
      new URLSearchParams(window.location.search).get("email") ||
      localStorage.getItem("pendingEmail");

    if (!email) {
      setResendError("We couldn't determine your email address. Please sign up again.");
      setResending(false);
      return;
    }

    // resendConfirmation never throws — it returns { success, error }
    const result = await resendConfirmation(email);
    if (result.success) {
      setResendSuccess(true);
    } else {
      const message =
        result.error instanceof Error && result.error.message
          ? result.error.message
          : "Could not resend the confirmation email. Please try again.";
      setResendError(message);
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Check your email
            </CardTitle>
            <CardDescription className="text-gray-600">
              We've sent you a confirmation link to verify your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Next steps:</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 text-left">
                  <li>1. Check your email inbox</li>
                  <li>2. Look for an email from us</li>
                  <li>3. Click the confirmation link</li>
                  <li>4. Return here to sign in</li>
                </ol>
              </div>

              <div className="text-sm text-gray-600">
                <p>Didn't receive the email?</p>
                <p className="text-xs text-gray-500 mt-1">
                  Check your spam folder or try resending
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendConfirmation}
                disabled={resending}
                variant="outline"
                className="w-full"
              >
                {resending ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Resending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Resend confirmation email</span>
                  </div>
                )}
              </Button>

              {resendSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  ✅ Confirmation email sent! Check your inbox.
                </div>
              )}

              {resendError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {resendError}
                </div>
              )}

              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <div className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to sign in</span>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
