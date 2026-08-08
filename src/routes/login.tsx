import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/haven-button";
import { Input } from "@/components/ui/text-field";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Haven" },
      { name: "description", content: "Log in to your Haven account to shop and bid on sneakers." },
      { property: "og:title", content: "Log in — Haven" },
      { property: "og:description", content: "Access your Haven account, cart and live auction bids." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/login" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate({ to: "/" });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Could not log in." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex items-center justify-center px-5 py-16 md:px-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="display text-3xl tracking-[0.28em]">
            HAVEN
          </Link>
          <h1 className="display mt-10 text-5xl">WELCOME BACK</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to shop drops and place live bids.
          </p>

          <form onSubmit={submit} noValidate className="mt-10 space-y-5">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
            />
            {errors.form ? (
              <p role="alert" className="rounded-sm border border-live/40 bg-live/5 px-3 py-2 text-xs font-medium text-live">
                {errors.form}
              </p>
            ) : null}
            <Button type="submit" size="lg" block loading={loading}>
              Log in
            </Button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-foreground underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>
      </section>

      <aside className="hidden items-end bg-[oklch(0.16_0.005_280)] p-12 lg:flex">
        <p className="display max-w-md text-[clamp(2.5rem,4vw,4rem)] text-[oklch(0.98_0_0)]">
          YOUR NEXT PAIR IS WAITING.
        </p>
      </aside>
    </main>
  );
}
