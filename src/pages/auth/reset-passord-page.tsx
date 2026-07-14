import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearStoredTokens, storeTokens } from "@/lib/api";
import { useUpdatePassword } from "@/services/auth/use-auth-mutation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);

  const navigate = useNavigate();
  const updatePasswordMutation = useUpdatePassword();

  // Supabase's recovery link redirects here with the session tokens in the
  // URL hash fragment (#access_token=...&refresh_token=...&type=recovery),
  // not a query param — GoTrue's own convention, same shape as its implicit
  // OAuth flow. Nothing else in the app reads this hash, so without this the
  // page renders a form that always 401s on submit (update-password requires
  // the Authorization header set from these tokens).
  //
  // The ref guard matters: this effect clears the hash via replaceState once
  // it consumes it, so React 18 StrictMode's dev-only double-invoke would
  // otherwise read an already-empty hash on its second pass and incorrectly
  // flag a just-succeeded link as invalid.
  const hasProcessedHash = useRef(false);

  useEffect(() => {
    if (hasProcessedHash.current) return;
    hasProcessedHash.current = true;

    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setLinkInvalid(true);
      return;
    }

    const expiresIn = params.get("expires_in");
    storeTokens({
      accessToken,
      refreshToken,
      expiresAt: expiresIn ? Date.now() + Number(expiresIn) * 1000 : null,
    });
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({ password });
      setSuccess(true);
      // The recovery session is single-purpose — don't leave the user
      // silently logged in as a side effect of resetting their password.
      clearStoredTokens();
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#DEF0F9] to-[#FDEBEC]">
      {/* Top - Logo */}
      <div className="p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xl font-semibold tracking-wide">AUREVO</span>
        </Link>
      </div>

      {/* Center - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8">
        <div className="w-full max-w-[550px]">
          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.08)] p-8 sm:p-10">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Set a Password
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your previous password has been reset. Please set a new password
                for your account.
              </p>
            </div>

            {/* Invalid/expired link */}
            {linkInvalid ? (
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  This link is invalid or has expired
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Request a new password reset link and try again.
                </p>
                <Link
                  to="/forgot-password"
                  className="text-[#FF6600] hover:text-[#E65C00] font-medium transition-colors"
                >
                  Back to forgot password
                </Link>
              </div>
            ) : success ? (
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
                  Password Updated!
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Your password has been successfully reset. Redirecting to
                  login...
                </p>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {(error || updatePasswordMutation.isError) && (
                  <div className="mb-5">
                    <span className="text-red-500 text-sm">
                      {error ||
                        updatePasswordMutation.error?.message ||
                        "Failed to reset password"}
                    </span>
                  </div>
                )}

                {/* Reset Password Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700 inline-block"
                    >
                      Create a new password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a new password"
                        className="h-12 border-gray-200 focus:border-[#FF6600] focus:ring-[#FF6600] rounded-lg pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-700 inline-block"
                    >
                      Re-type Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type Password"
                        className="h-12 border-gray-200 focus:border-[#FF6600] focus:ring-[#FF6600] rounded-lg pr-12"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                    className="w-full h-12 bg-[#111111] hover:bg-[#2A2A2A] text-white font-medium rounded-lg text-base"
                  >
                    {updatePasswordMutation.isPending
                      ? "Setting Password..."
                      : "Set Password"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
