import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/haven-button";
import { Input } from "@/components/ui/text-field";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { createOrder } from "@/services/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout - Haven" },
      { name: "description", content: "Complete your Haven order with shipping and payment details." },
      { property: "og:title", content: "Checkout - Haven" },
      { property: "og:description", content: "Secure checkout for authenticated sneakers at Haven." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

const FIELDS = [
  { key: "name", label: "Full name", autoComplete: "name", type: "text" },
  { key: "email", label: "Email", autoComplete: "email", type: "email" },
  { key: "phone", label: "Phone", autoComplete: "tel", type: "tel" },
] as const;

const ADDRESS_FIELDS = [
  { key: "address", label: "Address", autoComplete: "street-address" },
  { key: "city", label: "City", autoComplete: "address-level2" },
  { key: "state", label: "State", autoComplete: "address-level1" },
  { key: "postalCode", label: "Postal code", autoComplete: "postal-code" },
  { key: "country", label: "Country", autoComplete: "country-name" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"] | (typeof ADDRESS_FIELDS)[number]["key"];

function CheckoutPage() {
  const { lines, subtotal, shipping, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<FieldKey, string>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formError, setFormError] = useState<string>();
  const [paying, setPaying] = useState(false);

  const update = (key: FieldKey) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Partial<Record<FieldKey, string>> = {};
    (Object.keys(values) as FieldKey[]).forEach((key) => {
      if (!values[key].trim()) next[key] = "Required";
    });
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email.";
    setErrors(next);
    setFormError(undefined);
    if (Object.keys(next).length) return;

    setPaying(true);
    try {
      const result = await createOrder(values);
      await clearCart();
      toast.success(`Order ${result.order.id} created - your pair is reserved.`);
      navigate({ to: "/" });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not create order.");
    } finally {
      setPaying(false);
    }
  };

  if (lines.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-5 py-32 text-center">
          <h1 className="display text-5xl">NOTHING TO CHECK OUT</h1>
          <p className="mt-3 text-sm text-muted-foreground">Add a pair to your cart first.</p>
          <Button size="lg" className="mt-8" asChild>
            <Link to="/">Shop sneakers</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[100rem] px-5 py-12 md:px-8 md:py-20">
        <h1 className="display text-[clamp(2.5rem,8vw,6rem)]">CHECKOUT</h1>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
          <form onSubmit={submit} noValidate className="space-y-10">
            <section>
              <h2 className="display text-2xl">CUSTOMER INFORMATION</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {FIELDS.map((field) => (
                  <Input
                    key={field.key}
                    label={field.label}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    value={values[field.key]}
                    onChange={update(field.key)}
                    error={errors[field.key]}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="display text-2xl">SHIPPING ADDRESS</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {ADDRESS_FIELDS.map((field) => (
                  <Input
                    key={field.key}
                    label={field.label}
                    autoComplete={field.autoComplete}
                    value={values[field.key]}
                    onChange={update(field.key)}
                    error={errors[field.key]}
                    className={field.key === "address" ? "" : undefined}
                  />
                ))}
              </div>
            </section>

            <Button type="submit" size="lg" block loading={paying}>
              Pay {formatINR(total)}
            </Button>
            {formError ? (
              <p role="alert" className="rounded-sm border border-live/40 bg-live/5 px-3 py-2 text-xs font-medium text-live">
                {formError}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              This creates your Haven order. Payment will be added in a later phase.
            </p>
          </form>

          <aside className="h-fit rounded-sm border border-border bg-card p-6 lg:sticky lg:top-28">
            <h2 className="display text-2xl">ORDER SUMMARY</h2>
            <ul className="mt-6 space-y-4">
              {lines.map((line) => (
                <li key={line.id} className="flex items-center gap-3">
                  <img
                    src={line.image}
                    alt=""
                    width={96}
                    height={96}
                    loading="lazy"
                    className="size-14 rounded-sm bg-surface object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      UK {line.size} - Qty {line.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatINR(line.price * line.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-semibold">{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold">{formatINR(total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
