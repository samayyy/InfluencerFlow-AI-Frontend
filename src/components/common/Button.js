"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const Button = forwardRef(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-lg hover:shadow-xl transform hover:scale-105",
      secondary:
        "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
      outline:
        "border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500 transform hover:scale-105",
      ghost:
        "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500",
      danger:
        "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl",
      success:
        "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-lg hover:shadow-xl",
      gradient:
        "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white focus:ring-primary-500 shadow-lg hover:shadow-xl transform hover:scale-105",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg",
    };

    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-4 h-4",
      lg: "w-5 h-5",
      xl: "w-6 h-6",
    };

    const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `
      .trim()
      .replace(/\s+/g, " ");

    const iconSize = iconSizes[size];

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2
            className={`${iconSize} animate-spin ${children ? "mr-2" : ""}`}
          />
        )}

        {!loading && Icon && iconPosition === "left" && (
          <Icon className={`${iconSize} ${children ? "mr-2" : ""}`} />
        )}

        {children}

        {!loading && Icon && iconPosition === "right" && (
          <Icon className={`${iconSize} ${children ? "ml-2" : ""}`} />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
