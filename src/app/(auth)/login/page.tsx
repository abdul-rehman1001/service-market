import AuthCard from "@/components/auth/AuthCard";
import Input from "@/components/auth/Input";
import PasswordInput from "@/components/auth/PasswordInput";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8]">
      <AuthCard>
        <h2 className="text-3xl font-bold text-center">Welcome Back</h2>
        <p className="text-center mt-1 text-gray-500">Login to continue</p>

        <div className="mt-6 space-y-4">
          <Input placeholder="Email Address" />
          <PasswordInput placeholder="Password" />
        </div>

        <Link href="/(auth)/forgot-password" className="block mt-2 text-right text-sm text-blue-500 hover:underline">
          Forgot password?
        </Link>

        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition">
          Login
        </button>

        <p className="text-center mt-4 text-sm text-gray-600">
          Dont have an account?{" "}
          <Link href="/(auth)/register" className="text-blue-600 font-medium">
            Sign Up
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
