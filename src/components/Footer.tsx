import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-[100rem] px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="display text-3xl tracking-[0.28em]">HAVEN</p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Authenticated sneakers, curated releases and live auctions.
            </p>
          </div>

          <nav aria-label="Company">
            <h2 className="eyebrow mb-4 text-muted-foreground">Company</h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" hash="about" className="hover:underline">
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:hello@haven.example" className="hover:underline">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/auction" className="hover:underline">
                  Live auctions
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h2 className="eyebrow mb-4 text-muted-foreground">Legal</h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:underline">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:underline">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:underline">
                  Authenticity
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Social">
            <h2 className="eyebrow mb-4 text-muted-foreground">Social</h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="https://instagram.com" className="hover:underline">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://x.com" className="hover:underline">
                  X
                </a>
              </li>
              <li>
                <a href="https://youtube.com" className="hover:underline">
                  YouTube
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Haven. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
