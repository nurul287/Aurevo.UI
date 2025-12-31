import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import registerImage from "@/assets/image/register.png";
import GoogleIcon from "@/assets/icon/google-icon";
import FacebookIcon from "@/assets/icon/facebook-icon";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions");
      setLoading(false);
      return;
    }

    // Split full name into first and last name
    const nameParts = formData.fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const result = await signUp(formData.email, formData.password, {
        first_name: firstName,
        last_name: lastName,
      });

      if (result.error) {
        setError(result.error.message || "Registration failed");
      } else {
        // Store email for confirmation page
        localStorage.setItem("pendingEmail", formData.email);
        // Redirect to email confirmation page
        navigate(
          `/email-confirmation?email=${encodeURIComponent(formData.email)}`
        );
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
    <div className="flex min-h-screen bg-gradient-to-br from-[#DEF0F9] to-[#FDEBEC] gap-10">
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

        {/* Centered Image with Back to Website button */}
        <div className="flex-1 flex items-center justify-end">
                  <div className="relative">
            <img
              src={registerImage}
              alt="Register illustration"
              className="max-w-[700px] w-full h-auto object-contain"
                    />
                  </div>
                </div>
      </div>

      {/* Right Side - Register Form */}
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
          <div className="bg-inherit rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.08)] p-8 sm:p-10">
            {/* Header */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#FF6600] hover:text-[#E65C00] font-medium transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-5">
                <span className="text-red-500 text-sm">{error}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Field */}
                <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-medium text-gray-700 inline-block"
                >
                  Full Name
                  </Label>
                    <Input
                  id="fullName"
                  name="fullName"
                      type="text"
                      required
                  value={formData.fullName}
                      onChange={handleChange}
                  placeholder="Enter Your Name"
                  className="h-12 border-gray-200 focus:border-[#FF6600] focus:ring-[#FF6600] rounded-lg"
                    />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 inline-block"
                >
                  E-mail
                </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  placeholder="Your E-mail"
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
                    value={formData.password}
                    onChange={handleChange}
                  placeholder="6 - Digit Password"
                  className="h-12 border-gray-200 focus:border-[#FF6600] focus:ring-[#FF6600] rounded-lg"
                />
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) =>
                    setAgreeTerms(checked as boolean)
                  }
                  className="border-gray-300 data-[state=checked]:bg-[#FF6600] data-[state=checked]:border-[#FF6600]"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-[#FF6600] hover:text-[#E65C00] underline"
                  >
                    Terms & Condition
                  </Link>
                </Label>
              </div>

              {/* Create Account Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#FF6600] hover:bg-[#E65C00] text-white font-medium rounded-lg text-base"
              >
                {loading ? "Creating account..." : "Create an Account"}
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

export default RegisterPage;
