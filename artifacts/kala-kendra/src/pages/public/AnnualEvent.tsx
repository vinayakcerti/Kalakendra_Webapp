import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const pastEvents = [
  {
    year: "2024",
    title: "Natyanjali — An Offering Through Dance",
    description: "Fourteen students performed solo and ensemble pieces across an evening of Bharatanatyam and Carnatic music. The evening culminated in a group Alarippu and Pushpanjali, offered in gratitude to the tradition.",
    highlight: "Two Arangetrams — Priya Suresh and Ananya Krishnan",
  },
  {
    year: "2023",
    title: "Sangama — A Confluence",
    description: "A joint presentation combining Bharatanatyam, Carnatic vocal, and Kerala percussion. Students from all three disciplines performed together for the first time, demonstrating the deep interconnection of the classical arts.",
    highlight: "First-ever Panchavadyam ensemble at Kala Kendra",
  },
  {
    year: "2022",
    title: "Natya Utsavam — Festival of Dance",
    description: "Our post-pandemic return to the stage, bringing together over twenty students in a full evening programme. Guest artist Smt. Revathi Murthy performed a special Padam recital.",
    highlight: "Guest performance by Smt. Revathi Murthy",
  },
  {
    year: "2019",
    title: "Mrityunjaya — Triumph Over Impermanence",
    description: "A thematically unified programme exploring the cycle of creation, preservation, and dissolution through Bharatanatyam and Carnatic composition. Three Arangetrams were held.",
    highlight: "Three Arangetrams in a single season",
  },
];

const timeline = [
  { month: "May – June", activity: "Rehearsals intensify; students confirmed for the programme" },
  { month: "July", activity: "Costume fittings and stage lighting design" },
  { month: "August", activity: "Tech rehearsal and dress rehearsal at the venue" },
  { month: "September", activity: "Annual Showcase — typically the third Saturday of September" },
  { month: "October", activity: "Arangetrams (if any) held within four weeks of the showcase" },
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
            <div className="bg-background border border-secondary/20 p-8">
              <p className="text-secondary text-xs tracking-widest uppercase mb-4 font-semibold">2025 Showcase</p>
              <h4 className="text-3xl font-serif text-primary mb-2">Swara Tarangini</h4>
              <p className="text-muted-foreground text-sm italic mb-6">"Waves of Melody"</p>
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
                  <span>Göteborgs Konserthus, Gothenburg</span>
                </div>
                <div className="flex justify-between border-b border-secondary/10 pb-2">
                  <span className="font-medium text-primary">Admission</span>
                  <span>Free — all welcome</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="font-medium text-primary">Arangetrams</span>
                  <span>2 — Meera Nair & Vikram Sundaram</span>
                </div>
              </div>
              <div className="mt-8">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none w-full">
                  <Link href="/contact">Enquire About Tickets</Link>
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

      {/* Timeline */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Annual Calendar</p>
          <h3 className="text-4xl font-serif text-primary">The Year in Preparation</h3>
        </div>
        <div className="space-y-0">
          {timeline.map((item, idx) => (
            <div key={item.month} className="grid grid-cols-[140px_1fr] gap-8 items-start relative">
              <div className="text-right pr-8 pt-1">
                <p className="text-sm font-medium text-primary">{item.month}</p>
              </div>
              <div className="relative pb-10 pl-4 border-l border-secondary/30">
                <div className="absolute left-[-5px] top-2 w-2 h-2 border border-secondary/60 rotate-45 bg-background" />
                <p className="text-muted-foreground">{item.activity}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Past Events */}
      <section className="py-24 px-6 md:px-12 bg-card border-t border-secondary/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Archive</p>
            <h3 className="text-4xl font-serif text-primary">Past Showcases</h3>
          </div>
          <div className="space-y-6">
            {pastEvents.map((event) => (
              <div key={event.year} className="bg-background border border-secondary/20 p-8 grid md:grid-cols-[80px_1fr] gap-6 hover:border-secondary/50 transition-colors">
                <div>
                  <p className="font-serif text-3xl text-secondary">{event.year}</p>
                </div>
                <div>
                  <h4 className="font-serif text-2xl text-primary mb-3">{event.title}</h4>
                  <p className="text-muted-foreground leading-relaxed mb-4">{event.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-secondary">✦</span>
                    <span className="text-muted-foreground italic">{event.highlight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
