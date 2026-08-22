import { BrandMark } from "@/shared/ui/BrandMark";
import { LoginPage } from "@/modules/auth/LoginPage";

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <BrandMark size="lg" />
      <LoginPage />
    </div>
  );
}
