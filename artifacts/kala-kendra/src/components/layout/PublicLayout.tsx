import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { AnnouncementsBanner } from "@/components/AnnouncementsBanner";

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

      <AnnouncementsBanner />

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-secondary/20 py-16 px-6 md:px-12 bg-card mt-0">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <p className="font-serif text-2xl text-primary mb-4">Kala Kendra Sweden</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Preserving the classical arts of South India in Scandinavia since December 2024.
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
              <a href="mailto:kalakendrasweden@gmail.com" className="block hover:text-primary transition-colors">
                kalakendrasweden@gmail.com
              </a>
              <a
                href="https://wa.me/919207413346"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <svg className="h-3.5 w-3.5 text-green-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                +91 92074 13346
              </a>
              <a href="tel:+46769649871" className="flex items-center gap-2 hover:text-primary transition-colors">
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.62-.62a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
                +46 769 649 871
              </a>
              <a href="tel:+46720464163" className="flex items-center gap-2 hover:text-primary transition-colors">
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.62-.62a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
                +46 720 464 163
              </a>
              <a
                href="https://www.instagram.com/kala_kendra_sweden"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
                @kala_kendra_sweden
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
