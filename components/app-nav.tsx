"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/projects", label: "Projects" },
  { href: "/invoices", label: "Invoices" },
  { href: "/revenue", label: "Revenue" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOutUser } = useAuth();

  async function handleSignOut() {
    await signOutUser();
    router.replace("/login");
  }

  return (
    <header className="print:hidden sticky top-0 z-10 border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6">
        <span className="shrink-0 font-heading text-sm font-semibold">CPMS</span>
        <nav className="flex flex-1 gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                  active ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">
          {profile.displayName || user?.email}
        </span>
        <Button variant="outline" size="sm" className="shrink-0" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
