import React, { useState } from "react";
import AuthHeader from "./AuthHeader";
import InputField from "./InputField";
import { useForm } from "react-hook-form";
import axios from "axios";
import { generateKeys } from "../../utils/crypto";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";

const SignUpScreen = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "Nazrul Islam",
      username: "nazrulmum",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const secrets = await generateKeys(data.password);
      const apiBaseUrl = import.meta.env.DEV
        ? ""
        : "https://whisperbox.koyeb.app";
      const res = await axios.post(`${apiBaseUrl}/auth/register`, {
        username: data.username,
        display_name: data.name,
        password: data.password,
        ...secrets,
      });

      setAuth(res.data);

      navigate("/");
      console.log("registered successfully", res.data.user);
    } catch (err) {
      const message = err.response
        ? JSON.stringify(err.response.data)
        : err.request
          ? "No response from server. This may be a network or CORS issue."
          : err.message;
      console.error("register error", message, err.response, err.request);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6F6] flex items-center justify-center md:p-4">
      <div className="w-full max-w-95 bg-white overflow-hidden border border-gray-100">
        <div className="p-8 pt-10">
          <AuthHeader
            title="Sign up with Email"
            subtitle="Get chatting with friends and family today by signing up for our chat app!"
          />

          <InputField
            label="Your name"
            defaultValue="Nazrul Islam"
            error={errors.name?.message}
            {...register("name", { required: "Name is required" })}
          />

          <InputField
            label="Your username"
            type="text"
            defaultValue="nazrulmum"
            error={errors.username?.message}
            {...register("username", {
              required: "username is required",
            })}
          />

          <InputField
            label="Password"
            type="password"
            showPasswordToggle
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          <InputField
            label="Confirm Password"
            type="password"
            showPasswordToggle
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === passwordValue || "Passwords do not match",
            })}
          />

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || loading}
            className="w-full mt-8 py-4 bg-[#24786D] hover:bg-[#1e6457] disabled:bg-gray-400 transition-all text-white rounded-2xl text-base font-semibold active:scale-[0.985]"
          >
            {loading ? "Creating account..." : "Create an account"}
          </button>
          {errorMessage ? (
            <p className="mt-4 text-sm text-red-600 wrap-break-word">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;
