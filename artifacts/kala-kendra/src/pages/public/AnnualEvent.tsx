import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const galleryImages = [
  {
    src: "/images/taal-tarang-bharatanatyam-4.jpg",
    alt: "Bharatanatyam ensemble — four dancers in blue and gold",
    caption: "Bharatanatyam ensemble",
    span: "col-span-2 row-span-2",
  },
  {
    src: "/images/taal-tarang-mohiniyattam.jpg",
    alt: "Mohiniyattam performance — white classical costume",
    caption: "Mohiniyattam",
    span: "",
  },
  {
    src: "/images/taal-tarang-kids-blue.jpg",
    alt: "Young dancers in blue — Kids Batch",
    caption: "Kids Batch performance",
    span: "",
  },
  {
    src: "/images/taal-tarang-bharatanatyam-solo.jpg",
    alt: "Bharatanatyam solo — green and red costume",
    caption: "Bharatanatyam solo",
    span: "",
  },
  {
    src: "/images/taal-tarang-kathak2.jpg",
    alt: "Two dancers in white — Kathak duet",
    caption: "Contemporary classical duet",
    span: "",
  },
  {
    src: "/images/taal-tarang-kathak1.jpg",
    alt: "Dancers in white classical costume",
    caption: "Classical duet",
    span: "",
  },
  {
    src: "/images/taal-tarang-kids-skit.jpg",
    alt: "Children's skit — young performers",
    caption: "Kids Batch skit",
    span: "",
  },
  {
    src: "/images/taal-tarang-award.jpg",
    alt: "Award ceremony on stage — Taal Tarang 2025",
    caption: "Award ceremony",
    span: "",
  },
];

export default function AnnualEvent() {
  return (
    <div className="animate-in fade-in duration-700">

      {/* Header */}
      <section className="py-28 px-6 max-w-4xl mx-auto text-center">
        <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Annual Showcase</p>
        <h2 className="text-5xl md:text-7xl font-serif text-primary mb-4 leading-tight">
          Taal Tarang
        </h2>
        <p className="text-secondary/70 tracking-[0.5em] uppercase text-sm mb-8 font-semibold">ताल तरंग</p>
        <div className="gold-divider max-w-sm mx-auto" />
        <p className="text-xl text-muted-foreground mt-8 leading-relaxed max-w-2xl mx-auto">
          Kala Kendra Sweden's annual festival of rhythm and dance — where classical arts meet the Gothenburg stage.
        </p>
      </section>

      {/* TAAL TARANG 2025 — Completed */}
      <section className="py-16 px-6 md:px-12 bg-card border-y border-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 mb-4">
                <span className="w-2 h-2 bg-primary/60 rounded-full" />
                <span className="text-primary text-[10px] uppercase tracking-widest font-semibold">Completed · Inaugural Edition</span>
              </div>
              <h3 className="text-5xl font-serif text-primary mb-2">Taal Tarang 2025</h3>
              <p className="text-muted-foreground text-lg">Saturday, 1 November 2025 · Gothenburg, Sweden</p>
            </div>
            <div className="flex gap-6 text-center shrink-0">
              {[
                { value: "1st", label: "Edition" },
                { value: "Nov 1", label: "2025" },
                { value: "Live", label: "Audience" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-serif text-3xl text-primary">{s.value}</p>
                  <p className="text-secondary text-[10px] uppercase tracking-widest mt-1 font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed max-w-3xl mb-4 text-lg">
            Kala Kendra Sweden's inaugural annual showcase — Taal Tarang 2025 — was a landmark evening of classical Indian arts performed before a live Gothenburg audience. Students from across all disciplines took to the stage for the first time, presenting Bharatanatyam, Mohiniyattam, and ensemble pieces with the rigour and devotion of the Guru-Shishya tradition.
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mb-12">
            From the youngest performers of the Kids Batch to senior classical soloists, the evening demonstrated the depth and breadth of what has been built in just one year. The programme included a special award ceremony honouring contributions to the arts community.
          </p>

          {/* Photo gallery — masonry-style grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {/* Large feature image */}
            <div className="col-span-2 row-span-2 overflow-hidden group">
              <img
                src="/images/taal-tarang-bharatanatyam-4.jpg"
                alt="Bharatanatyam ensemble — four dancers in blue and gold"
                className="w-full h-full object-cover aspect-square md:aspect-auto md:h-[480px] group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Top right 1 */}
            <div className="overflow-hidden group">
              <img
                src="/images/taal-tarang-mohiniyattam.jpg"
                alt="Mohiniyattam"
                className="w-full h-[232px] object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Top right 2 */}
            <div className="overflow-hidden group">
              <img
                src="/images/taal-tarang-kids-blue.jpg"
                alt="Kids Batch — blue sparkle costumes"
                className="w-full h-[232px] object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Bottom right 1 */}
            <div className="overflow-hidden group">
              <img
                src="/images/taal-tarang-bharatanatyam-solo.jpg"
                alt="Bharatanatyam solo"
                className="w-full h-[232px] object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Bottom right 2 */}
            <div className="overflow-hidden group">
              <img
                src="/images/taal-tarang-kathak2.jpg"
                alt="Classical duet in white"
                className="w-full h-[232px] object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Row 3 — full width 4 images */}
            <div className="overflow-hidden group">
              <img
                src="/images/taal-tarang-kathak1.jpg"
                alt="Dancers in white"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="overflow-hidden group">
              <img
                src="/images/taal-tarang-kids-skit.jpg"
                alt="Kids skit"
                className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="overflow-hidden group">
              <img
                src="/images/taal-tarang-group1.jpg"
                alt="Group performance"
                className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="overflow-hidden group">
              <img
                src="/images/taal-tarang-award.jpg"
                alt="Award ceremony"
                className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4 italic">
            Photographs from Taal Tarang 2025 · Gothenburg, Sweden · 1 November 2025
          </p>
        </div>
      </section>

      {/* TAAL TARANG 2026 — Coming Soon */}
      <section className="py-24 px-6 md:px-12 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Decorative background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
          <span className="font-serif text-[20vw] leading-none">२०२६</span>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 px-3 py-1.5 mb-6">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-secondary text-[10px] uppercase tracking-widest font-semibold">Officially Declared · Coming Soon</span>
              </div>
              <h3 className="text-5xl md:text-6xl font-serif mb-3 leading-tight">Taal Tarang 2026</h3>
              <p className="text-primary-foreground/70 text-sm uppercase tracking-widest mb-6 font-medium">
                ताल तरंग · Second Edition
              </p>
              <div className="h-[1px] w-24 bg-secondary/50 mb-6" />
              <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-xl mb-8">
                The second edition of Taal Tarang has been officially announced. Building on the success of our inaugural showcase, Taal Tarang 2026 will be an even grander celebration of classical Indian arts on the Gothenburg stage.
              </p>
              <p className="text-primary-foreground/60 text-sm italic mb-8">
                "What began as a first offering has become a tradition. We return — with greater depth, greater devotion."
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-none px-10 py-5 text-base">
                  <Link href="/contact">Register Your Interest</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-none border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-10 py-5 text-base">
                  <Link href="/consent">Submit Consent Form</Link>
                </Button>
              </div>

              {/* Performer note */}
              <div className="mt-8 border border-secondary/30 bg-primary-foreground/5 px-6 py-4 max-w-xl">
                <p className="text-secondary text-[10px] uppercase tracking-widest font-semibold mb-2">Performing in Taal Tarang 2026?</p>
                <p className="text-primary-foreground/75 text-sm leading-relaxed">
                  All students participating as performers are required to submit a signed participant consent form before rehearsals begin.
                  The form covers performance terms, photo consent, attendance commitment, and liability.
                </p>
              </div>
            </div>

            {/* Date card */}
            <div className="shrink-0 border border-secondary/40 bg-primary-foreground/5 p-10 text-center min-w-[220px]">
              <p className="text-secondary text-[10px] uppercase tracking-widest font-semibold mb-5">Save the Date</p>
              <div className="border-b border-secondary/30 pb-5 mb-5">
                <p className="font-serif text-6xl text-primary-foreground leading-none mb-1">7</p>
                <p className="text-primary-foreground/70 text-sm uppercase tracking-widest">November</p>
              </div>
              <p className="font-serif text-4xl text-secondary mb-1">2026</p>
              <p className="text-primary-foreground/50 text-xs mt-3 uppercase tracking-widest">Gothenburg, Sweden</p>
            </div>
          </div>
        </div>
      </section>

      {/* About the event */}
      <section className="py-20 px-6 md:px-12 border-b border-secondary/20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">What It Is</p>
            <h3 className="text-3xl font-serif text-primary mb-6">A Sacred Offering to the Tradition</h3>
            <p className="drop-cap text-muted-foreground leading-relaxed mb-6">
              Taal Tarang is not a school recital. It is a formal classical concert — held to the same standards of presentation, technical quality, and thematic depth as any professional performance in India. For students, it is the moment when years of patient practice become visible to the world.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Each edition's programme is built around a theme drawn from the Puranas, the epics, or the philosophy of the arts themselves. Every dance piece, every composition is chosen to illuminate that theme — the result is not a collection of performances but a single unified offering.
            </p>
          </div>
          <div className="space-y-5">
            <div className="bg-card border border-secondary/20 p-6">
              <p className="text-primary font-serif text-lg mb-2">What is an Arangetram?</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The Arangetram is a student's first solo public performance — a milestone that typically occurs after 7–10 years of dedicated study. It is the formal declaration that the student is ready to carry the tradition forward independently.
              </p>
            </div>
            <div className="bg-secondary/5 border border-secondary/20 p-6">
              <p className="text-secondary text-[10px] uppercase tracking-widest font-semibold mb-3">Founded by</p>
              <p className="font-serif text-primary text-xl mb-1">Mrs. Noopura Parvathi A</p>
              <p className="text-muted-foreground text-sm">Kala Kendra Sweden · Gothenburg</p>
              <div className="mt-3 pt-3 border-t border-secondary/20">
                <p className="text-secondary text-[10px] uppercase tracking-widest font-semibold mb-1">Under the mentorship of</p>
                <p className="text-primary text-sm font-medium">Padmashree Kaithapram Damodaran Namboodiri</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h3 className="text-3xl font-serif text-primary mb-4">Be Part of Taal Tarang 2026</h3>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Taal Tarang is free and open to all. Students wishing to perform should speak with their Guru. Those wishing to begin their journey should apply now.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 py-6 text-lg">
            <Link href="/apply">Apply for Admission</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-none border-secondary text-primary hover:bg-secondary/10 px-10 py-6 text-lg">
            <Link href="/consent">Participant Consent Form</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-none border-secondary text-primary hover:bg-secondary/10 px-10 py-6 text-lg">
            <Link href="/contact">General Enquiries</Link>
          </Button>
        </div>

        {/* Consent form callout */}
        <div className="max-w-xl mx-auto mt-10 border border-secondary/25 bg-card px-6 py-5 text-left">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-8 h-8 bg-primary/10 flex items-center justify-center mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
              </svg>
            </div>
            <div>
              <p className="font-serif text-primary text-base mb-1">Performing students — submit your consent form</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All students selected to perform in Taal Tarang 2026 must complete and submit the participant consent form before rehearsals begin. This covers performance terms, photo &amp; video consent, attendance requirements, and liability. The form can be submitted digitally or printed for a physical signature.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
