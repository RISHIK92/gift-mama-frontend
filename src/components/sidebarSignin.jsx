import axios from "axios";
import { styled } from "@mui/material/styles";
import { CustomInput } from "./input";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../Url";
import { CustomButton } from "./button";

export function SidebarSignin() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignin() {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    if (!email || !password) {
      setError("Email and password are required!");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}login`, {
        email,
        password,
      });

      localStorage.setItem("authToken", response.data.token);
      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[24.5rem] bg-white rounded-2xl w-full max-w-md mx-auto p-6 shadow-lg md:w-[28rem]">
      <div className="text-3xl md:text-4xl font-semibold text-center md:text-left">
        <p>Welcome Back!</p>
      </div>

      <div className="flex justify-center md:justify-start items-center text-sm mt-3 gap-1">
        <span>Don't have an account?</span>
        <a
          href="#"
          className="text-red-500 font-light underline ml-2 hover:text-red-600"
          onClick={() => navigate("/signup")}
        >
          Register
        </a>
      </div>
      {error && (
        <div className="text-red-600 text-sm text-center mt-2">{error}</div>
      )}

      <div className="mt-4 mb-3">
        <CustomInput
          placeholder="Email Address"
          ref={emailRef}
          fullWidth
          radius="10px"
        />
      </div>
      <div className="mt-2">
        <CustomInput
          type="password"
          placeholder="Password"
          ref={passwordRef}
          fullWidth
          radius="10px"
        />
      </div>
      <div className="flex items-center mt-4 mb-8">
        <input
          type="checkbox"
          id="remember"
          className="mr-2 w-5 h-5 border border-gray-300 rounded-md accent-[#FF3B3B]"
        />
        <label htmlFor="remember" className="text-xs font-extralight">
          Remember me
        </label>

        <a
          href="#"
          className="ml-auto text-xs font-extralight text-[#FF3B3B] underline hover:text-red-600"
        >
          Forgot Password?
        </a>
      </div>

      <div onClick={handleSignin}>
        {!loading ? (
          <CustomButton
            bg="#FF3B3B"
            color="white"
            padding="12px 24px"
            font="12px"
            radius="10px"
            hover="#C20000"
            border="#C20000"
            className="w-full"
          >
            Login
          </CustomButton>
        ) : (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#C20000] border-opacity-50"></div>
          </div>
        )}
      </div>
    </div>
  );
}
