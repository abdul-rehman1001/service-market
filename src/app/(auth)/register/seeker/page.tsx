import AuthCard from "@/components/auth/AuthCard";
import Input from "@/components/auth/Input";
import PasswordInput from "@/components/auth/PasswordInput";

export default function RegisterSeeker() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8]">
      <AuthCard>
        <h2 className="text-3xl font-bold text-center">Service Seeker</h2>
        <p className="text-center mt-1 text-gray-500">Join to find experts</p>

        <div className="mt-6 space-y-4">
          <Input placeholder="Full Name" />
          <Input placeholder="Email Address" />
          <PasswordInput placeholder="Password" />
        </div>

        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition">
          Create Account
        </button>
      </AuthCard>
    </div>
  );
}
