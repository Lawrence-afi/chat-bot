import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  showPasswordToggle = false,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle && showPassword ? "text" : type;

  return (
    <div className="mb-6">
      <label className="block text-[#24786D] text-sm font-medium mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full px-5 py-3.5 border-b focus:outline-none focus:ring-2 transition-all text-base
            ${
              error
                ? "border-red-500 bg-red-50"
                : "border-gray-200  focus:outline-none focus:ring-[#24786D]/30"
            }`}
          {...rest}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
    </div>
  );
};

export default InputField;
