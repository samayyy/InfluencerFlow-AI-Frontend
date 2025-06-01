"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      placeholder,
      error,
      success,
      helperText,
      required = false,
      disabled = false,
      icon: Icon,
      iconPosition = "left",
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const baseInputClasses =
      "w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

    const getInputClasses = () => {
      let classes = baseInputClasses;

      if (error) {
        classes +=
          " border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50";
      } else if (success) {
        classes +=
          " border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50";
      } else if (focused) {
        classes +=
          " border-primary-500 focus:border-primary-500 focus:ring-primary-500/20";
      } else {
        classes +=
          " border-gray-300 focus:border-primary-500 focus:ring-primary-500/20 hover:border-gray-400";
      }

      // Add padding for icons
      if (Icon && iconPosition === "left") {
        classes += " pl-12";
      }
      if (Icon && iconPosition === "right") {
        classes += " pr-12";
      }
      if (isPassword) {
        classes += " pr-12";
      }

      return `${classes} ${className}`;
    };

    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {Icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon
                className={`w-5 h-5 ${
                  error
                    ? "text-red-400"
                    : success
                    ? "text-green-400"
                    : "text-gray-400"
                }`}
              />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={getInputClasses()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          <div className="absolute inset-y-0 right-0 flex items-center">
            {isPassword && (
              <button
                type="button"
                className="pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            )}

            {!isPassword && Icon && iconPosition === "right" && (
              <div className="pr-3 flex items-center pointer-events-none">
                <Icon
                  className={`w-5 h-5 ${
                    error
                      ? "text-red-400"
                      : success
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                />
              </div>
            )}

            {/* Status Icons */}
            {error && !isPassword && !Icon && (
              <div className="pr-3 flex items-center pointer-events-none">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
            )}

            {success && !isPassword && !Icon && (
              <div className="pr-3 flex items-center pointer-events-none">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            )}
          </div>
        </div>

        {/* Helper Text, Error, or Success Message */}
        {(error || success || helperText) && (
          <div className="text-sm">
            {error && (
              <p className="text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-green-600 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                {success}
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
