import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/haven-button";
import heroImage from "@/assets/hero.jpg";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[oklch(0.16_0.005_280)] text-[oklch(0.98_0_0)]">
      <img
        src={heroImage}
        alt="A premium sneaker lit on a concrete plinth in a dark studio"
        width={1920}
        height={1200}
        className="absolute inset-0 size-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.005_280)] via-[oklch(0.12_0.005_280)]/80 to-transparent" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-[100rem] flex-col justify-center px-5 py-24 md:px-8">
        <p className="eyebrow text-[oklch(0.98_0_0)]/70">Authenticated · Curated · Live</p>
        <h1 className="display mt-6 text-[clamp(4rem,16vw,13rem)]">HAVEN</h1>
        <p className="mt-4 max-w-md text-lg text-[oklch(0.98_0_0)]/80 md:text-xl">
          Find your next pair.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" variant="live" asChild className="sm:min-w-56">
            <Link to="/auction">
              <span className="mr-1 inline-block size-2 animate-pulse rounded-full bg-current" aria-hidden="true" />
              Live Auctions
            </Link>
          </Button>
          <Button
            size="lg"
            asChild
            className="border border-[oklch(0.98_0_0)]/40 bg-transparent text-[oklch(0.98_0_0)] hover:bg-[oklch(0.98_0_0)] hover:text-[oklch(0.16_0.005_280)] sm:min-w-56"
          >
            <Link to="/" hash="featured">
              Shop Sneakers
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
