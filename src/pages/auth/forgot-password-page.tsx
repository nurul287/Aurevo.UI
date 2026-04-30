import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePasswordReset } from "@/services/auth/use-auth-mutation";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import forgotPasswordImage from "@/assets/image/forgot-password.png";
import GoogleIcon from "@/assets/icon/google-icon";
import FacebookIcon from "@/assets/icon/facebook-icon";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const passwordResetMutation = usePasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await passwordResetMutation.mutateAsync(email);
      setSuccess(true);
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    console.log("Google login clicked");
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook login
    console.log("Facebook login clicked");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#DEF0F9] to-[#FDEBEC] lg:gap-10">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col p-8">
        {/* Back Arrow + Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xl font-semibold tracking-wide">AUREVO</span>
        </Link>

        {/* Centered Image */}
        <div className="flex-1 flex items-center justify-end">
          <img
            src={forgotPasswordImage}
            alt="Forgot password illustration"
            className="max-w-[700px] w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-start p-8">
        <div className="w-full max-w-[650px] mx-auto lg:mx-0">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xl font-semibold tracking-wide">
                AUREVO
              </span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-inherit rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.08)] p-8">
            {/* Back to Login Link */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to login
            </Link>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Forgot Your Password?
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Don't worry, happens to all of us. Enter your email below to
                recover your password
              </p>
            </div>

            {/* Success Message */}
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Check your email
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  We've sent a password reset link to{" "}
                  <span className="font-medium text-gray-700">{email}</span>
                </p>
                <Link
                  to="/login"
                  className="text-[#FF6600] hover:text-[#E65C00] font-medium transition-colors"
                >
                  Back to login
                </Link>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {passwordResetMutation.isError && (
                  <div className="mb-5">
                    <span className="text-red-500 text-sm">
                      {passwordResetMutation.error?.message ||
                        "Failed to send reset email"}
                    </span>
                  </div>
                )}

                {/* Forgot Password Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 inline-block"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Your Email"
                      className="h-12 border-gray-200 focus:border-[#FF6600] focus:ring-[#FF6600] rounded-lg"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={passwordResetMutation.isPending}
                    className="w-full h-12 bg-[#111111] hover:bg-[#2A2A2A] text-white font-medium rounded-lg text-base"
                  >
                    {passwordResetMutation.isPending ? "Sending..." : "Submit"}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-400"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#FDEBEC] text-gray-600">
                      Or register With
                    </span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    className="flex-1 h-12 border-gray-200 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    <GoogleIcon className="w-5 h-5 mr-2" />
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFacebookLogin}
                    className="flex-1 h-12 border-gray-200 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    <FacebookIcon className="w-5 h-5 mr-2" />
                    Facebook
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
