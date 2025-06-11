"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  CheckCircle,
  PlayCircle,
  Menu,
  X,
  Globe,
  Target,
  Sparkles,
  Bot,
  Mail,
  Phone,
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-white">
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrollY > 50
            ? "bg-white/95 backdrop-blur-lg shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">
                InfluencerFlow AI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="nav-link">
                Features
              </a>
              <a href="#how-it-works" className="nav-link">
                How it Works
              </a>
              <a href="#pricing" className="nav-link">
                Pricing
              </a>
              <a href="#contact" className="nav-link">
                Contact
              </a>
              <Link href="/auth/login" className="btn-outline">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary">
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in-down">
              <div className="px-4 py-6 space-y-4">
                <a
                  href="#features"
                  className="block nav-link"
                  onClick={toggleMenu}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="block nav-link"
                  onClick={toggleMenu}
                >
                  How it Works
                </a>
                <a
                  href="#pricing"
                  className="block nav-link"
                  onClick={toggleMenu}
                >
                  Pricing
                </a>
                <a
                  href="#contact"
                  className="block nav-link"
                  onClick={toggleMenu}
                >
                  Contact
                </a>
                <div className="pt-4 space-y-3">
                  <Link
                    href="/auth/login"
                    className="block w-full btn-outline text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full btn-primary text-center"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-10"></div>
        {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%230ea5e9" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div> */}
        <div
          className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-40`}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium mb-8 animate-bounce-slow">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Influencer Marketing Platform
            </div>

            <h1
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Revolutionize Your
              <span className="block gradient-text">Influencer Marketing</span>
            </h1>

            <p
              className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              Discover, connect, and manage influencer partnerships with
              AI-powered precision. Automate your creator campaigns and scale
              your brand's reach like never before.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <Link
                href="/auth/signup"
                className="btn-primary flex text-lg px-8 py-4 animate-glow"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 mt-1" />
              </Link>
              <button className="flex items-center text-primary-600 hover:text-primary-700 font-medium">
                <PlayCircle className="w-6 h-6 mr-2" />
                Watch Demo
              </button>
            </div>

            <div
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center animate-fade-in-up"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary-600">10K+</div>
                <div className="text-gray-600">Verified Creators</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary-600">95%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary-600">$2M+</div>
                <div className="text-gray-600">Campaign Value</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-1/3 right-10 w-16 h-16 bg-secondary-200 rounded-full opacity-20 animate-float-delayed"></div>
        {/* <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-primary-300 rounded-full opacity-30 animate-pulse-slow"></div> */}
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Marketers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to run successful influencer campaigns,
              powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "AI-Powered Discovery",
                description:
                  "Find the perfect creators using natural language search and AI recommendations",
                color: "bg-blue-500",
              },
              {
                icon: Target,
                title: "Smart Matching",
                description:
                  "Automatically match brands with creators based on audience, engagement, and brand fit",
                color: "bg-purple-500",
              },
              {
                icon: MessageSquare,
                title: "Automated Outreach",
                description:
                  "Send personalized emails and make AI-powered calls to negotiate with creators",
                color: "bg-green-500",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Track campaign performance with detailed metrics and ROI analysis",
                color: "bg-orange-500",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description:
                  "Handle creator payouts securely with integrated payment processing",
                color: "bg-red-500",
              },
              {
                icon: TrendingUp,
                title: "Campaign Management",
                description:
                  "Manage entire campaign lifecycle from discovery to completion",
                color: "bg-indigo-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From discovery to payment, we've streamlined the entire influencer
              marketing process
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Discover Creators",
                description:
                  "Use AI-powered search to find creators that match your brand and campaign goals",
                icon: Globe,
              },
              {
                step: "02",
                title: "Smart Outreach",
                description:
                  "Send personalized emails and make AI-powered calls to connect with creators",
                icon: MessageSquare,
              },
              {
                step: "03",
                title: "Manage Campaigns",
                description:
                  "Track all interactions, manage content approvals, and monitor campaign progress",
                icon: BarChart3,
              },
              {
                step: "04",
                title: "Process Payments",
                description:
                  "Securely handle creator payments and track ROI with detailed analytics",
                icon: Zap,
              },
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-30 transform -translate-x-10"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Leading Brands
            </h2>
            <p className="text-gray-600">
              Join thousands of brands already using InfluencerFlow AI
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {[
              "Brand 1",
              "Brand 2",
              "Brand 3",
              "Brand 4",
              "Brand 5",
              "Brand 6",
            ].map((brand, index) => (
              <div
                key={index}
                className="bg-gray-200 h-16 rounded-lg flex items-center justify-center text-gray-500 font-semibold"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. Start free and scale as you
              grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "Forever",
                description: "Perfect for small brands getting started",
                features: [
                  "Up to 5 creator searches per month",
                  "Basic analytics",
                  "Email support",
                  "1 active campaign",
                ],
                cta: "Get Started",
                popular: false,
              },
              {
                name: "Professional",
                price: "$99",
                period: "per month",
                description: "For growing brands and agencies",
                features: [
                  "Unlimited creator searches",
                  "Advanced AI recommendations",
                  "Automated outreach tools",
                  "Priority support",
                  "Up to 10 active campaigns",
                  "Advanced analytics dashboard",
                ],
                cta: "Start Free Trial",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "Contact us",
                description: "For large teams and enterprises",
                features: [
                  "Everything in Professional",
                  "Custom integrations",
                  "Dedicated account manager",
                  "White-label options",
                  "Custom analytics",
                  "SLA guarantee",
                ],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                  plan.popular
                    ? "border-primary-500 bg-gradient-to-b from-primary-50 to-white"
                    : "border-gray-200 bg-white hover:border-primary-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                    plan.popular
                      ? "bg-primary-600 hover:bg-primary-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Influencer Marketing?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of brands already using InfluencerFlow AI to scale
            their creator partnerships
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Start Free Trial
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-4 px-8 rounded-lg transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-primary-600 mr-4" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">hello@influencerflow.ai</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-primary-600 mr-4" />
                  <div>
                    <div className="font-medium text-gray-900">Phone</div>
                    <div className="text-gray-600">+1 (555) 123-4567</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="input-field"
                    placeholder="Your message"
                  ></textarea>
                </div>
                <button type="submit" className="w-full btn-primary">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">InfluencerFlow AI</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing influencer marketing with AI-powered solutions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InfluencerFlow AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
