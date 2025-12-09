import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import loginImage from "@/assets/image/login.png";
import GoogleIcon from "@/assets/icon/google-icon";
import FacebookIcon from "@/assets/icon/facebook-icon";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error.message || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
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
    <div className="min-h-screen flex bg-gradient-to-br from-[#DEF0F9] to-[#FDEBEC] gap-10">
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
            src={loginImage}
            alt="Login illustration"
            className="max-w-[700px] w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-start p-8">
        <div className="w-full max-w-[650px]">
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
            {/* Header */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-500 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#FF6600] hover:text-[#E65C00] font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-5">
                <span className="text-red-500 text-sm">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
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
                  placeholder="Enter your email"
                  className="h-12 border-gray-200 focus:border-[#FF6600] focus:ring-[#FF6600] rounded-lg"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 inline-block"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 border-gray-200 focus:border-[#FF6600] focus:ring-[#FF6600] rounded-lg"
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    className="border-gray-300 data-[state=checked]:bg-[#FF6600] data-[state=checked]:border-[#FF6600]"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#FF6600] hover:text-[#E65C00] font-medium transition-colors"
                >
                  Forgot Password
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#FF6600] hover:bg-[#E65C00] text-white font-medium rounded-lg text-base"
              >
                {loading ? "Logging in..." : "Log in"}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
