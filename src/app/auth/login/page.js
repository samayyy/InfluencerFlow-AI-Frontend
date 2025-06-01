"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/authContext";
import Button from "../../../components/common/Button";
import { Sparkles, ArrowLeft, Mail, Shield, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, isAuthenticated, isLoading, error, clearError } =
    useAuth();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Load Google Sign-In script
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) return;

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    let os = "Unknown";

    // Detect browser
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    // Detect OS
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "MacOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
      os = "iOS";

    return {
      device_type: /Mobile|Android|iPhone|iPad/.test(userAgent)
        ? "mobile"
        : "desktop",
      browser,
      os,
    };
  };

  const handleGoogleLogin = () => {
    if (!window.google) {
      setGoogleError(
        "Google Sign-In is not available. Please refresh the page."
      );
      return;
    }

    setIsGoogleLoading(true);
    setGoogleError("");
    clearError();

    window.google.accounts.id.initialize({
      client_id:
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "509297366198-0rr6bk49h3pa424k67c8del6b7ok09d6.apps.googleusercontent.com",
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt();
  };

  const handleGoogleResponse = async (response) => {
    try {
      const deviceInfo = getDeviceInfo();
      const result = await loginWithGoogle(response.credential, deviceInfo);

      if (result.success) {
        if (result.isNewUser) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        setGoogleError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setGoogleError("An unexpected error occurred. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Discovery",
      description: "Find perfect creators using advanced AI algorithms",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security for all your campaigns",
    },
    {
      icon: Mail,
      title: "Automated Outreach",
      description: "Streamline communication with creators",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Section - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>

            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to your InfluencerFlow AI account
            </p>
          </div>

          {/* Error Messages */}
          {(error || googleError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <p className="text-red-600 text-sm">{googleError || error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              loading={isGoogleLoading}
              onClick={handleGoogleLogin}
              className="border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 justify-center"
            >
              {!isGoogleLoading && (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Secure authentication powered by Google
                </span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign up for free
              </Link>
            </p>

            <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-700">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 to-secondary-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`}
        ></div>

        <div className="relative flex flex-col justify-center px-12 py-24">
          <div className="text-center text-white mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Join thousands of brands
            </h3>
            <p className="text-primary-100 text-lg">
              Already using InfluencerFlow AI to scale their creator
              partnerships
            </p>
          </div>

          <div className="space-y-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 animate-fade-in-right"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-primary-100">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-primary-100">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-white/20 rounded-full border-2 border-white/30"
                  />
                ))}
              </div>
              <span className="text-sm">+1,000 happy customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
