import { ReactNode } from "react";
import { Link, useLocation } from "wouter";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Our Lineage" },
  { href: "/programmes", label: "Programmes" },
  { href: "/apply", label: "Apply" },
  { href: "/contact", label: "Contact" },
  { href: "/admin", label: "Admin" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-secondary/20 py-8 px-6 md:px-12 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl text-primary font-serif tracking-wide mb-6">
          Kala Kendra Sweden
        </h1>
        <nav className="flex flex-wrap justify-center gap-6 text-sm uppercase tracking-widest text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`hover:text-primary transition-colors ${
                location === link.href ? "text-primary font-medium border-b border-primary/40 pb-1" : ""
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

      <footer className="border-t border-secondary/20 py-12 px-6 text-center text-muted-foreground mt-24">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <p className="font-serif text-2xl text-primary mb-4">Kala Kendra Sweden</p>
          <div className="gold-divider max-w-xs my-4" />
          <p className="text-sm">Gothenburg, Sweden</p>
          <p className="text-sm mt-2">Preserving the classical arts of South India in Scandinavia.</p>
        </div>
      </footer>
    </div>
  );
}
