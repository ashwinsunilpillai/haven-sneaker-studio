import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, User2, X } from "lucide-react";
import { useState } from "react";

import { CartIcon } from "@/components/CartIcon";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/haven-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto grid max-w-[100rem] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3.5 md:px-8 lg:grid-cols-[14rem_minmax(0,1fr)_auto]">
        <Link
          to="/"
          className="display shrink-0 text-2xl tracking-[0.28em] md:text-3xl"
          aria-label="Haven home"
        >
          HAVEN
        </Link>

        <div className="hidden min-w-0 lg:block">
          <SearchBar className="mx-auto max-w-xl" />
        </div>
        <div className="lg:hidden" aria-hidden="true" />

        <nav className="flex items-center gap-1 md:gap-2" aria-label="Primary">
          <Link
            to="/auction"
            className="hidden items-center gap-2 rounded-sm px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-secondary md:inline-flex"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-live" aria-hidden="true" />
            Live Auctions
          </Link>

          <CartIcon />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="hidden size-10 items-center justify-center rounded-sm transition-colors hover:bg-secondary md:inline-flex"
                aria-label="Account menu"
              >
                <User2 aria-hidden="true" className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-sm">
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel className="truncate capitalize">
                    {user?.name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/cart">Cart</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auction">My auctions</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>Log out</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login">Log in</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/signup">Sign up</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="haven-mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-sm transition-colors hover:bg-secondary md:hidden"
          >
            {mobileOpen ? (
              <Menu className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>

      <div className="border-t border-border px-5 py-3 lg:hidden">
        <SearchBar />
      </div>

      {mobileOpen ? (
        <div
          id="haven-mobile-menu"
          className="border-t border-border bg-background px-5 py-4 md:hidden"
        >
          <div className="flex items-center justify-between pb-3">
            <span className="eyebrow text-muted-foreground">Menu</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="inline-flex size-8 items-center justify-center rounded-sm hover:bg-secondary"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <ul className="space-y-1 text-sm font-semibold uppercase tracking-[0.14em]">
            <li>
              <Link to="/" onClick={() => setMobileOpen(false)} className="block py-3">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/auction"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 py-3"
              >
                <span className="size-1.5 animate-pulse rounded-full bg-live" aria-hidden="true" />
                Live Auctions
              </Link>
            </li>
            <li>
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="block py-3">
                Cart
              </Link>
            </li>
          </ul>
          <div className="mt-4 border-t border-border pt-4">
            {isAuthenticated ? (
              <Button variant="outline" block onClick={handleLogout}>
                Log out
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
