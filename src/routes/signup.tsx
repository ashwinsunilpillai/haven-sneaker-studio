import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/haven-button";
import { Input } from "@/components/ui/text-field";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an account — Haven" },
      { name: "description", content: "Create a Haven account to shop authenticated sneakers and join live auctions." },
      { property: "og:title", content: "Create an account — Haven" },
      { property: "og:description", content: "Join Haven for curated sneaker drops and live bidding." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/signup" },
    ],
    links: [{ rel: "canonical", href: "/signup" }],
  }),
  component: SignupPage,
});

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  form?: string;
}

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (values.password.length < 6) next.password = "Use at least 6 characters.";
    if (values.confirm !== values.password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await signup(values.name.trim(), values.email, values.password);
      navigate({ to: "/" });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Could not create account." });
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
          <h1 className="display mt-10 text-5xl">CREATE ACCOUNT</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            One account for shopping, saved pairs and live bidding.
          </p>

          <form onSubmit={submit} noValidate className="mt-10 space-y-5">
            <Input
              label="Name"
              autoComplete="name"
              placeholder="Alex Mehta"
              value={values.name}
              onChange={update("name")}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={update("email")}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.password}
              onChange={update("password")}
              error={errors.password}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.confirm}
              onChange={update("confirm")}
              error={errors.confirm}
            />
            {errors.form ? (
              <p role="alert" className="rounded-sm border border-live/40 bg-live/5 px-3 py-2 text-xs font-medium text-live">
                {errors.form}
              </p>
            ) : null}
            <Button type="submit" size="lg" block loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-foreground underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </section>

      <aside className="hidden items-end bg-[oklch(0.16_0.005_280)] p-12 lg:flex">
        <p className="display max-w-md text-[clamp(2.5rem,4vw,4rem)] text-[oklch(0.98_0_0)]">
          BUILT FOR PEOPLE WHO CHASE PAIRS.
        </p>
      </aside>
    </main>
  );
}
