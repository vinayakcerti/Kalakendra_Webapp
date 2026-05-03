import { Link } from "wouter";
import { Button } from "@/components/ui/button";


import carnaticImg from "@/assets/images/carnatic.png";
import keralaImg from "@/assets/images/kerala-arts.png";

const testimonials = [
  {
    quote: "The discipline instilled here is unlike any other. My daughter has grown not only as a dancer but as a person of depth and character.",
    name: "Priya Venkataraman",
    role: "Parent of student since 2019",
  },
  {
    quote: "I came with no background in classical music. Three years later I performed my first kacheri. The patience and rigour of the teaching is extraordinary.",
    name: "Erik Johansson",
    role: "Carnatic Vocal student",
  },
  {
    quote: "Finding authentic Bharatanatyam instruction in Gothenburg was something I had given up on. Kala Kendra is a true miracle for our community.",
    name: "Lakshmi Iyer",
    role: "Parent & community member",
  },
];

const pillars = [
  {
    sanskrit: "Shastra",
    english: "Theory",
    description: "Every movement, note, and gesture is grounded in centuries of codified classical knowledge.",
  },
  {
    sanskrit: "Prayoga",
    english: "Practice",
    description: "Rigorous, patient repetition is the only path to mastery. We train the body, mind, and spirit together.",
  },
  {
    sanskrit: "Bhava",
    english: "Devotion",
    description: "The deepest purpose of the classical arts is not performance — it is offering, surrender, and love.",
  },
];

export default function Home() {
  return (
    <div className="animate-in fade-in duration-700">

      {/* Hero */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-32 relative">
        <p className="text-secondary tracking-[0.4em] uppercase text-xs mb-8 font-semibold">
          Gothenburg, Sweden · Est. December 2024
        </p>
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-primary mb-8 max-w-4xl leading-[1.05]">
          Preserving the Classical Arts of South India
        </h2>
        <div className="gold-divider max-w-sm mx-auto" />
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-6 mb-14 leading-relaxed">
          Authentic, rigorous instruction in Bharatanatyam, Kuchipudi, Mohiniyattam, and Carnatic Music — rooted in the Guru-Shishya tradition, taught in the heart of Scandinavia.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 py-6 rounded-none border border-primary/20">
            <Link href="/apply">Apply for Admission</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-none border-secondary text-primary hover:bg-secondary/10 text-lg px-10 py-6">
            <Link href="/programmes">Our Programmes</Link>
          </Button>
        </div>
      </section>

      {/* Ethos */}
      <section className="py-28 px-6 md:px-12 lg:px-24 bg-card border-y border-secondary/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="gold-frame rotate-1 hover:rotate-0 transition-transform duration-500">
            <img src="/images/bharatanatyam-real.jpg" alt="Bharatanatyam Dancer" className="w-full h-auto aspect-[4/5] object-cover object-top" />
          </div>
          <div>
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Our Ethos</p>
            <h3 className="text-4xl md:text-5xl font-serif text-primary mb-8 leading-tight">
              A Sanctuary for the Arts
            </h3>
            <p className="drop-cap text-muted-foreground leading-relaxed mb-6 text-lg">
              Kala Kendra Sweden operates not merely as a school, but as a sacred space. Here, the relationship between Guru and Shishya — teacher and student — is foundational to everything. We believe mastery requires not just physical discipline, but spiritual and emotional devotion.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">
              We welcome students of all ages and backgrounds who approach learning with reverence, patience, and a willingness to immerse themselves in a living tradition that stretches back millennia.
            </p>
            <Button asChild variant="outline" className="rounded-none border-secondary text-primary hover:bg-secondary/10">
              <Link href="/about">Our Lineage &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-28 px-6 max-w-6xl mx-auto text-center">
        <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">The Three Pillars</p>
        <h3 className="text-4xl font-serif text-primary mb-4">What We Stand For</h3>
        <div className="gold-divider max-w-xs mx-auto" />
        <div className="grid md:grid-cols-3 gap-12 mt-16 text-left">
          {pillars.map((pillar) => (
            <div key={pillar.sanskrit} className="relative pl-6 border-l border-secondary/30">
              <p className="font-accent text-4xl text-secondary mb-1">{pillar.sanskrit}</p>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">{pillar.english}</p>
              <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programmes Preview */}
      <section className="py-28 px-6 md:px-12 bg-card border-y border-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Disciplines</p>
            <h3 className="text-4xl font-serif text-primary">Programmes of Study</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                img: "/images/bharatanatyam-real.jpg",
                title: "Bharatanatyam",
                subtitle: "Classical Dance · Tamil Nadu",
                desc: "The ancient temple dance of Tamil Nadu — intricate footwork, expressive abhinaya, and sculptural precision.",
                href: "/programmes#bharatanatyam",
              },
              {
                img: "/images/bharatanatyam-real.jpg",
                title: "Kuchipudi",
                subtitle: "Classical Dance · Andhra Pradesh",
                desc: "A vibrant dance-drama tradition from Andhra Pradesh — athletic footwork, graceful abhinaya, and the iconic tarangam.",
                href: "/programmes#kuchipudi",
              },
              {
                img: keralaImg,
                title: "Mohiniyattam",
                subtitle: "Classical Dance · Kerala",
                desc: "The lyrical, graceful classical dance of Kerala — soft swaying movements and deeply devotional expression.",
                href: "/programmes#mohiniyattam",
              },
              {
                img: carnaticImg,
                title: "Carnatic Music",
                subtitle: "Vocal & Instrumental",
                desc: "One of the world's oldest and most complex musical systems, offered in vocal and instrumental streams.",
                href: "/programmes#carnatic",
              },
            ].map((prog) => (
              <Link key={prog.title} href={prog.href} className="group block">
                <div className="overflow-hidden border border-secondary/20 group-hover:border-secondary/60 transition-colors">
                  <div className="overflow-hidden">
                    <img
                      src={prog.img}
                      alt={prog.title}
                      className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 bg-background">
                    <p className="text-secondary text-xs tracking-widest uppercase mb-2">{prog.subtitle}</p>
                    <h4 className="text-2xl font-serif text-primary mb-3">{prog.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{prog.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="ghost" className="rounded-none text-primary hover:bg-transparent hover:text-secondary underline decoration-secondary/40 underline-offset-4">
              <Link href="/programmes">View Full Programme Details &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Founding Lineage */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Our Roots</p>
            <h3 className="text-4xl font-serif text-primary">A Lineage from Kerala to Gothenburg</h3>
            <div className="gold-divider max-w-xs mx-auto mt-6" />
          </div>
          <div className="grid md:grid-cols-3 gap-0 items-stretch">
            {/* Padmashree */}
            <div className="border border-secondary/20 p-8 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-none overflow-hidden border-2 border-secondary/40 mb-5 shrink-0">
                <img src="/images/kaithapuram-damodaran-namboodiri.jpg" alt="Padmashree Kaithapram Damodaran Namboodiri" className="w-full h-full object-cover object-top" />
              </div>
              <p className="text-secondary text-xs uppercase tracking-widest font-semibold mb-2">The Original</p>
              <h4 className="font-serif text-xl text-primary mb-1 leading-snug">Padmashree Kaithapram Damodaran Namboodiri</h4>
              <p className="text-muted-foreground text-xs mb-3 uppercase tracking-widest">Founder, Swathi Thirunnal Kalakendram Trust</p>
              <p className="text-muted-foreground text-sm leading-relaxed">Padmashree awardee and celebrated lyricist who founded the institution that set the standard for classical arts education in Kerala.</p>
            </div>
            {/* Connector */}
            <div className="border-y border-secondary/20 px-4 flex flex-col items-center justify-center text-center py-8">
              <div className="hidden md:flex flex-col items-center gap-3 w-full">
                <div className="h-[1px] w-full bg-secondary/30 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-secondary/60 rotate-45 bg-background" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-secondary/60 rotate-45 bg-background" />
                </div>
              </div>
              <div className="w-32 h-32 rounded-none overflow-hidden border-2 border-secondary/40 mb-5 shrink-0 mt-6 md:mt-0">
                <img src="/images/deepankuran-kaithapuram.jpg" alt="Deepankuran Kaithapram" className="w-full h-full object-cover object-top" />
              </div>
              <p className="text-secondary text-xs uppercase tracking-widest font-semibold mb-2">First Franchise</p>
              <h4 className="font-serif text-xl text-primary mb-1">Deepankuran Kaithapram</h4>
              <p className="text-muted-foreground text-xs mb-3 uppercase tracking-widest">Founder, Kala Kendra Kochi</p>
              <p className="text-muted-foreground text-sm leading-relaxed">Son of Padmashree Kaithapram, he founded Kala Kendra Kochi — the first franchise — extending the lineage with his own musicianship.</p>
            </div>
            {/* Kala Kendra Sweden */}
            <div className="border border-secondary/20 p-8 flex flex-col items-center text-center bg-primary/5">
              <div className="w-32 h-32 rounded-none overflow-hidden border-2 border-primary/40 mb-5 shrink-0 flex items-center justify-center bg-background">
                <img src="/images/kala-kendra-logo.jpg" alt="Kala Kendra Sweden" className="w-full h-full object-cover" />
              </div>
              <p className="text-secondary text-xs uppercase tracking-widest font-semibold mb-2">Second Franchise</p>
              <h4 className="font-serif text-xl text-primary mb-1">Kala Kendra Sweden</h4>
              <p className="text-muted-foreground text-xs mb-3 uppercase tracking-widest">Gothenburg · Est. December 2024</p>
              <p className="text-muted-foreground text-sm leading-relaxed">Founded in December 2024 by Mrs. Noopura Parvathi under the blessing of Deepankuran Kaithapram — carrying the same Guru-Shishya tradition to the Indian diaspora in Scandinavia.</p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="rounded-none border-secondary text-primary hover:bg-secondary/10">
              <Link href="/about">Read the Full Lineage Story &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Voices</p>
          <h3 className="text-4xl font-serif text-primary">From Our Community</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card border border-secondary/20 p-8 relative">
              <div className="absolute top-4 left-6 font-serif text-6xl text-secondary/20 leading-none select-none">"</div>
              <p className="text-muted-foreground leading-relaxed mb-6 pt-6 italic font-serif text-lg">
                {t.quote}
              </p>
              <div className="h-[1px] w-12 bg-secondary/40 mb-4" />
              <p className="text-primary font-medium text-sm">{t.name}</p>
              <p className="text-muted-foreground text-xs mt-1">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Heritage teaser */}
      <section className="py-20 px-6 md:px-12 bg-card border-y border-secondary/20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">The Tradition</p>
          <h3 className="text-4xl font-serif text-primary mb-6">
            Two Thousand Years of Living Tradition
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            The classical arts of South India are not relics. They are living, breathing transmissions of spiritual wisdom — preserved through an unbroken chain of devoted Gurus across two millennia.
          </p>
          <Button asChild variant="outline" className="rounded-none border-secondary text-primary hover:bg-secondary/10">
            <Link href="/heritage">Explore the Heritage &rarr;</Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 md:px-12 bg-primary text-primary-foreground text-center">
        <p className="tracking-[0.3em] uppercase text-xs mb-6 text-primary-foreground/60 font-semibold">Admissions Open</p>
        <h3 className="text-4xl md:text-5xl font-serif mb-6">Begin Your Journey</h3>
        <div className="h-[1px] w-32 bg-primary-foreground/20 mx-auto mb-8" />
        <p className="max-w-2xl mx-auto mb-12 text-primary-foreground/80 text-lg leading-relaxed">
          We review each application individually to ensure students are placed in the appropriate batch. Admissions are open for the upcoming intake.
        </p>
        <Button asChild className="bg-background text-primary hover:bg-background/90 rounded-none text-lg px-14 py-6">
          <Link href="/apply">Submit Application</Link>
        </Button>
      </section>

    </div>
  );
}
