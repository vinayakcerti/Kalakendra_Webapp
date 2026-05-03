import { ReactNode } from "react";
import { Link, useLocation } from "wouter";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Our Lineage" },
  { href: "/heritage", label: "Heritage" },
  { href: "/programmes", label: "Programmes" },
  { href: "/classes", label: "Classes" },
  { href: "/annual-event", label: "Annual Event" },
  { href: "/apply", label: "Apply" },
  { href: "/contact", label: "Contact" },
  { href: "/portal/login", label: "Student Portal" },
  { href: "/admin", label: "Admin" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-secondary/20 py-6 px-6 md:px-12 flex flex-col items-center">
        <Link href="/">
          <div className="flex flex-col items-center gap-3 mb-5 hover:opacity-80 transition-opacity cursor-pointer">
            <img
              src="/images/kala-kendra-logo.jpg"
              alt="Kala Kendra Sweden"
              className="h-20 w-auto object-contain"
            />
            <h1 className="text-3xl md:text-4xl text-primary font-serif tracking-wide">
              Kala Kendra Sweden
            </h1>
          </div>
        </Link>
        <nav className="flex flex-wrap justify-center gap-5 text-xs uppercase tracking-widest text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-primary transition-colors pb-1 ${
                isActive(link.href)
                  ? "text-primary font-semibold border-b border-primary/50"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-secondary/20 py-16 px-6 md:px-12 bg-card mt-0">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <p className="font-serif text-2xl text-primary mb-4">Kala Kendra Sweden</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Preserving the classical arts of South India in Scandinavia since 2009.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">Navigation</p>
            <div className="space-y-2">
              {NAV_LINKS.filter(l => l.href !== "/admin").map((link) => (
                <div key={link.href}>
                  <Link href={link.href} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">Contact</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Gothenburg, Sweden</p>
              <a href="mailto:namaskaram@kalakendra.se" className="block hover:text-primary transition-colors">
                namaskaram@kalakendra.se
              </a>
              <div className="pt-2">
                <Link href="/privacy" className="text-xs hover:text-primary transition-colors underline underline-offset-2">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="gold-divider max-w-xs mx-auto" />
        <p className="text-center text-muted-foreground text-xs mt-8">
          © {new Date().getFullYear()} Kala Kendra Sweden. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
