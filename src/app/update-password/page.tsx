import { BrandMark } from "@/shared/ui/BrandMark";
import { UpdatePasswordPage } from "@/modules/auth/UpdatePasswordPage";

export default function UpdatePassword() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <BrandMark size="lg" />
      <UpdatePasswordPage />
    </div>
  );
}
