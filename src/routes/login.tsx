import { LoginForm } from "@/components/auth/login-form";
import { createFileRoute } from "@tanstack/react-router";

interface LoginSearch {
  next?: string;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    next: typeof search.next === "string" ? search.next : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();

  return (
    <div className="flex flex-1 justify-center">
      <LoginForm next={next} />
    </div>
  );
}
