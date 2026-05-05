import React, { useState } from "react";
import AuthHeader from "./AuthHeader";
import InputField from "./InputField";
import { useForm } from "react-hook-form";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";

const SignInScreen = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      const apiBaseUrl = import.meta.env.DEV
        ? ""
        : "https://whisperbox.koyeb.app";

      const res = await axios.post(`${apiBaseUrl}/auth/login`, {
        username: data.username,
        password: data.password,
      });

      const response = res.data;

      // ✅ Validate expected structure (defensive programming)
      if (!response.access_token || !response.user) {
        throw new Error("Invalid login response structure");
      }

      // ✅ Store auth correctly
      setAuth({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type,
        expires_in: Date.now() + response.expires_in * 1000,
        user: response.user,
      });

      console.log("Login successful:", response.user.username);

      navigate("/");
    } catch (err) {
      const message = err.response
        ? JSON.stringify(err.response.data)
        : err.request
          ? "No response from server. This may be a network or CORS issue."
          : err.message;

      console.error("login error", message);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6F6] flex items-center justify-center p-4">
      <div className="w-full max-w-95 bg-white overflow-hidden border border-gray-100">
        <div className="p-8 pt-10">
          <AuthHeader
            title="Log in to Chatbox"
            subtitle="Welcome back! Sign in to continue"
          />

          <InputField
            label="Your username"
            type="text"
            error={errors.username?.message}
            {...register("username", { required: "Username is required" })}
          />

          <InputField
            label="Password"
            type="password"
            error={errors.password?.message}
            showPasswordToggle
            {...register("password", {
              required: "Password is required",
            })}
          />

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || loading}
            className="w-full mt-8 py-4 bg-[#24786D] hover:bg-[#1e6457] disabled:bg-gray-400 transition-all text-white rounded-2xl text-base font-semibold shadow-lg shadow-[#24786D]/30 active:scale-[0.985]"
          >
            {loading ? "Signing in..." : "Log in"}
          </button>

          {errorMessage && (
            <p className="mt-4 text-sm text-red-600 break-words">
              {errorMessage}
            </p>
          )}

          <div className="text-center mt-6">
            <a
              href="#"
              className="text-[#24786D] hover:underline text-sm font-medium"
            >
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInScreen;
