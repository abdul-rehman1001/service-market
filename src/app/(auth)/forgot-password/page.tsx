import AuthCard from "@/components/auth/AuthCard";
import Input from "@/components/auth/Input";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8]">
      <AuthCard>
        <h2 className="text-3xl font-bold text-center">Forgot Password?</h2>
        <p className="text-center mt-1 text-gray-500">
          Enter your email to receive reset instructions.
        </p>

        <div className="mt-6 space-y-4">
          <Input placeholder="Email Address" />
        </div>

        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition">
          Send Reset Link
        </button>
      </AuthCard>
    </div>
  );
}
