import AuthCard from "@/components/auth/AuthCard";
import RoleCard from "@/components/auth/RoleCard";

export default function RegisterChooseRole() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8]">
      <AuthCard>
        <h2 className="text-3xl font-bold text-center">Create Your Account</h2>
        <p className="text-center mt-1 text-gray-500">Choose your account type</p>

        <div className="flex gap-4 mt-6">
          <RoleCard
            href="/(auth)/register/seeker"
            title="Service Seeker"
            description="Find professionals for your task."
            icon="🔍"
          />

          <RoleCard
            href="/(auth)/register/provider"
            title="Service Provider"
            description="Offer your skills and services."
            icon="🧰"
          />
        </div>
      </AuthCard>
    </div>
  );
}
