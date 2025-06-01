"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/authContext";
import Button from "../../components/common/Button";
import {
  Sparkles,
  ArrowLeft,
  Users,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

export default function SignupPage() {
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

  const handleGoogleSignup = () => {
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
        // Always go to onboarding for new signups
        router.push("/onboarding");
      } else {
        setGoogleError(result.error || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setGoogleError("An unexpected error occurred. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const benefits = [
    {
      icon: Users,
      title: "10,000+ Verified Creators",
      description: "Access to the largest database of verified influencers",
    },
    {
      icon: Zap,
      title: "AI-Powered Matching",
      description: "Smart algorithms find the perfect creators for your brand",
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Track campaign performance with detailed metrics",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Hassle-free payments with enterprise-grade security",
    },
  ];

  const steps = [
    "Sign up with Google",
    "Set up your brand profile",
    "Start discovering creators",
    "Launch your first campaign",
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
      {/* Left Section - Signup Form */}
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
              Start your journey
            </h2>
            <p className="text-gray-600">
              Join thousands of brands using InfluencerFlow AI
            </p>
          </div>

          {/* Error Messages */}
          {(error || googleError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <p className="text-red-600 text-sm">{googleError || error}</p>
            </div>
          )}

          {/* Google Sign Up Button */}
          <div className="space-y-4">
            <Button
              variant="gradient"
              size="lg"
              fullWidth
              loading={isGoogleLoading}
              onClick={handleGoogleSignup}
              className="justify-center shadow-xl"
            >
              {!isGoogleLoading && (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Sign up with Google - It's Free!
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Free forever • No credit card required
                </span>
              </div>
            </div>
          </div>

          {/* Steps Preview */}
          <div className="mt-8 p-4 bg-primary-50 rounded-lg">
            <h4 className="text-sm font-medium text-primary-900 mb-3">
              Get started in 4 simple steps:
            </h4>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-primary-700"
                >
                  <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-3">
                    {index + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in here
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

            <p className="mt-4 text-xs text-gray-500">
              By signing up, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Benefits */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 to-blue-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`}
        ></div>
        <div className="relative flex flex-col justify-center px-12 py-24">
          <div className="text-center text-white mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Everything you need to succeed
            </h3>
            <p className="text-green-100 text-lg">
              Powerful tools to scale your influencer marketing campaigns
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm animate-fade-in-right"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    {benefit.title}
                  </h4>
                  <p className="text-green-100 text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-green-100 bg-white/10 rounded-full px-4 py-2">
              <span className="text-2xl">🚀</span>
              <span className="text-sm font-medium">
                Join 1,000+ successful brands today
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
