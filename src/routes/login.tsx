import { LoginForm } from "@/components/auth/login-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex flex-1 justify-center">
      <LoginForm />
    </div>
  );
}
