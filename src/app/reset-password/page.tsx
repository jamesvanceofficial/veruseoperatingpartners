import { BrandMark } from "@/shared/ui/BrandMark";
import { ResetPasswordPage } from "@/modules/auth/ResetPasswordPage";

export default function ResetPassword() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <BrandMark size="lg" />
      <ResetPasswordPage />
    </div>
  );
}
