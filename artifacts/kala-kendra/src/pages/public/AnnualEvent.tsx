import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const timeline = [
  { month: "Jan – Mar 2025", activity: "Foundation batch classes begin; students assessed for showcase readiness" },
  { month: "Apr – May", activity: "Showcase theme announced; repertoire selection and rehearsals begin" },
  { month: "June – July", activity: "Rehearsals intensify; costume design and fittings" },
  { month: "August", activity: "Tech rehearsal and dress rehearsal at the venue" },
  { month: "September", activity: "Inaugural Annual Showcase — third Saturday of September" },
];

const arangetramFacts = [
  { label: "Duration of Study", value: "7 – 10 years" },
  { label: "Decision", value: "At the Guru's sole discretion" },
  { label: "Format", value: "Full solo programme, 3+ hours" },
  { label: "Significance", value: "First independent public performance" },
];

export default function AnnualEvent() {
  return (
    <div className="animate-in fade-in duration-700">

      {/* Header */}
      <section className="py-28 px-6 max-w-4xl mx-auto text-center">
        <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Every Autumn</p>
        <h2 className="text-5xl md:text-6xl font-serif text-primary mb-8 leading-tight">
          The Annual Showcase
        </h2>
        <div className="gold-divider max-w-sm mx-auto" />
        <p className="text-xl text-muted-foreground mt-8 leading-relaxed max-w-2xl mx-auto">
          Each year, Kala Kendra Sweden presents a full evening of classical performance, bringing students to the public stage in Gothenburg's finest concert venues.
        </p>
      </section>

      {/* About the event */}
      <section className="py-16 px-6 md:px-12 bg-card border-y border-secondary/20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">What It Is</p>
            <h3 className="text-3xl font-serif text-primary mb-6">A Sacred Offering to the Tradition</h3>
            <p className="drop-cap text-muted-foreground leading-relaxed mb-6">
              The Annual Showcase is not a school recital. It is a formal classical concert — held to the same standards of presentation, technical quality, and thematic depth as any professional performance in India. For students, it is the moment when years of patient practice become visible.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Each year's programme is built around a theme drawn from the Puranas, the epics, or the philosophy of the arts themselves. Every item — every dance piece, every composition — is chosen to illuminate that theme. The result is not a collection of performances but a single unified offering.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The event also provides the occasion for Arangetrams — the formal debut of students who have completed the full foundational curriculum. An Arangetram at Kala Kendra is held only when the Guru judges the student fully ready, and it is a cause for celebration by the entire community.
            </p>
          </div>

          <div className="space-y-6">
            {/* 2025 Showcase card */}
            <div className="bg-background border border-secondary/20 p-8">
              <div className="flex items-start justify-between mb-4">
                <p className="text-secondary text-xs tracking-widest uppercase font-semibold">Inaugural Showcase · 2025</p>
                <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-1 uppercase tracking-widest font-semibold">Upcoming</span>
              </div>
              <h4 className="text-3xl font-serif text-primary mb-2">Swara Tarangini</h4>
              <p className="text-muted-foreground text-sm italic mb-6">"Waves of Melody" — our first public offering to Gothenburg</p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex justify-between border-b border-secondary/10 pb-2">
                  <span className="font-medium text-primary">Date</span>
                  <span>Saturday, 20 September 2025</span>
                </div>
                <div className="flex justify-between border-b border-secondary/10 pb-2">
                  <span className="font-medium text-primary">Time</span>
                  <span>18:30 — Doors open at 18:00</span>
                </div>
                <div className="flex justify-between border-b border-secondary/10 pb-2">
                  <span className="font-medium text-primary">Venue</span>
                  <span>Gothenburg — TBA</span>
                </div>
                <div className="flex justify-between border-b border-secondary/10 pb-2">
                  <span className="font-medium text-primary">Admission</span>
                  <span>Free — all welcome</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="font-medium text-primary">Programme</span>
                  <span>Bharatanatyam, Mohiniyattam, Carnatic</span>
                </div>
              </div>
              <div className="mt-8">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none w-full">
                  <Link href="/contact">Register Interest</Link>
                </Button>
              </div>
            </div>

            <div className="bg-secondary/5 border border-secondary/20 p-6">
              <p className="text-primary font-serif text-lg mb-2">What is an Arangetram?</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The Arangetram is a student's first solo public performance — a milestone that typically occurs after 7–10 years of dedicated study. It is the formal declaration that the student is ready to carry the tradition forward independently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inaugural Year Banner */}
      <section className="py-20 px-6 md:px-12 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <p className="tracking-[0.3em] uppercase text-xs mb-6 text-primary-foreground/60 font-semibold">December 2024 — Our First Season</p>
          <h3 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
            Writing the First Chapter
          </h3>
          <div className="h-[1px] w-32 bg-primary-foreground/20 mx-auto mb-8" />
          <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            Kala Kendra Sweden opened its doors in December 2024 — bringing an unbroken lineage of classical arts from Trivandrum, Kerala to Gothenburg, Sweden. The 2025 Annual Showcase will be our first, and we intend it to set a standard that endures for generations.
          </p>
          <p className="text-primary-foreground/60 text-sm italic">
            Founded by Mrs. Noopura Parvathi A · Under the mentorship of Padmashree Kaithapram Damodaran Namboodiri
          </p>
        </div>
      </section>

      {/* Arangetram facts */}
      <section className="py-24 px-6 md:px-12 bg-card border-b border-secondary/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Milestone</p>
            <h3 className="text-3xl font-serif text-primary">The Arangetram</h3>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">The most significant event in a classical artist's journey — held only when the Guru deems the student worthy.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-secondary/20">
            {arangetramFacts.map((fact, i) => (
              <div key={fact.label} className={`p-8 text-center ${i < 3 ? "border-r-0 sm:border-r border-secondary/20" : ""} ${i >= 2 ? "border-t border-secondary/20 sm:border-t-0 lg:border-t-0" : ""}`}>
                <p className="text-secondary text-[10px] uppercase tracking-widest font-semibold mb-3">{fact.label}</p>
                <p className="font-serif text-xl text-primary leading-snug">{fact.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">2025 Calendar</p>
          <h3 className="text-4xl font-serif text-primary">The Year in Preparation</h3>
        </div>
        <div className="space-y-0">
          {timeline.map((item, idx) => (
            <div key={item.month} className="grid grid-cols-[180px_1fr] gap-8 items-start relative">
              <div className="text-right pr-8 pt-1">
                <p className="text-sm font-medium text-primary">{item.month}</p>
              </div>
              <div className="relative pb-10 pl-4 border-l border-secondary/30">
                {idx === timeline.length - 1 && (
                  <div className="absolute left-[-5px] top-2 w-2 h-2 bg-primary rotate-45" />
                )}
                {idx < timeline.length - 1 && (
                  <div className="absolute left-[-5px] top-2 w-2 h-2 border border-secondary/60 rotate-45 bg-background" />
                )}
                <p className="text-muted-foreground">{item.activity}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-secondary/20">
        <h3 className="text-3xl font-serif text-primary mb-4">Attend or Perform</h3>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          The Annual Showcase is free and open to all. Students wishing to participate should speak with their Guru. Those wishing to begin their journey should apply now.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 py-6 text-lg">
            <Link href="/apply">Apply for Admission</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-none border-secondary text-primary hover:bg-secondary/10 px-10 py-6 text-lg">
            <Link href="/contact">General Enquiries</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
