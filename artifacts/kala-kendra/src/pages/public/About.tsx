import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const lineage = [
  {
    era: "Ancient",
    period: "2nd century BCE – 16th century CE",
    text: "The Natya Shastra of Bharata Muni codifies all aspects of classical performance — from hand gestures to stage geography. The devadasi tradition kept Bharatanatyam alive in temples across Tamil Nadu for over a millennium.",
  },
  {
    era: "Revival",
    period: "1930s – 1960s",
    text: "Visionaries like Rukmini Devi Arundale rescued Bharatanatyam from the temple courtyards and placed it on the concert stage, preserving its spiritual depth while making it accessible to all.",
  },
  {
    era: "Diaspora",
    period: "1990s – present",
    text: "As the Indian diaspora settled in Europe, dedicated teachers carried the tradition westward. Today, classical arts thrive in cities from London to Gothenburg — rooted in the same Guru-Shishya bond.",
  },
];

export default function About() {
  return (
    <div className="animate-in fade-in duration-700">

      {/* Header */}
      <section className="py-28 px-6 max-w-4xl mx-auto text-center">
        <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Our Story</p>
        <h2 className="text-5xl md:text-6xl font-serif text-primary mb-8 leading-tight">
          Lineage & Philosophy
        </h2>
        <div className="gold-divider max-w-sm mx-auto" />
        <p className="text-xl text-muted-foreground mt-8 leading-relaxed">
          A school rooted in an unbroken tradition, carried from the temples of South India to the shores of Scandinavia.
        </p>
      </section>

      {/* Philosophy */}
      <section className="py-16 px-6 md:px-12 bg-card border-y border-secondary/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Philosophy</p>
            <h3 className="text-4xl font-serif text-primary mb-8">The Guru-Shishya Parampara</h3>
            <p className="drop-cap text-muted-foreground leading-relaxed mb-6 text-lg">
              The Guru-Shishya Parampara — the lineage of teacher and devoted student — is the spine of Indian classical arts. Knowledge is not extracted from a syllabus; it is transmitted, over years, through the direct and intimate relationship between Guru and student.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              At Kala Kendra, we take this seriously. Classes are small. Teachers know every student by name, temperament, and aspiration. Progress is measured not in examinations but in depth of understanding and quality of presence.
            </p>
            <blockquote className="pull-quote">
              "Art is not a performance. It is an offering. When the dancer disappears, only the dance remains."
            </blockquote>
            <p className="text-muted-foreground leading-relaxed mt-6">
              We accept students who are prepared to commit — not to a term, but to a path. Many of our students study with us for a decade or more, progressing through the full curriculum to performance readiness.
            </p>
          </div>
          <div className="gold-frame -rotate-1 hover:rotate-0 transition-transform duration-500">
            <img
              src="/images/bharatanatyam-real.jpg"
              alt="Bharatanatyam performance"
              className="w-full h-auto aspect-[4/5] object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* Lineage Timeline */}
      <section className="py-28 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">History</p>
          <h3 className="text-4xl font-serif text-primary">The Living Lineage</h3>
        </div>
        <div className="space-y-12">
          {lineage.map((item, idx) => (
            <div key={item.era} className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
              <div className="text-right md:border-r border-secondary/30 pr-8">
                <p className="font-serif text-2xl text-primary">{item.era}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.period}</p>
              </div>
              <div className="relative md:pl-4">
                {idx < lineage.length - 1 && (
                  <div className="hidden md:block absolute left-[-17px] top-4 bottom-[-48px] w-[1px] bg-secondary/20" />
                )}
                <div className="hidden md:block absolute left-[-21px] top-3 w-2 h-2 border border-secondary/60 rotate-45 bg-background" />
                <p className="text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Button asChild variant="outline" className="rounded-none border-secondary text-primary hover:bg-secondary/10">
            <Link href="/heritage">Explore the Full Heritage &rarr;</Link>
          </Button>
        </div>
      </section>

      {/* Franchise Lineage Timeline */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Franchise Lineage</p>
          <h3 className="text-4xl font-serif text-primary">From Kerala to Scandinavia</h3>
          <div className="gold-divider max-w-xs mx-auto mt-6" />
        </div>
        <div className="relative">
          {/* Vertical connector line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-secondary/25 -translate-x-1/2" />

          {/* Node 1 — Original Institution */}
          <div className="relative flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="md:w-1/2 md:text-right md:pr-12">
              <p className="text-secondary text-xs uppercase tracking-widest font-semibold mb-1">The Original</p>
              <h4 className="text-2xl font-serif text-primary mb-2">Padmashree Kaithapram Damodaran Namboodiri</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">Padmashree awardee, celebrated lyricist, and visionary founder of Swathi Thirunnal Kalakendram — the institution that set the standard for classical arts education rooted in the Guru-Shishya tradition.</p>
            </div>
            <div className="relative z-10 flex-shrink-0 w-10 h-10 border-2 border-secondary bg-background rotate-45 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-secondary" />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <div className="inline-block bg-secondary/10 border border-secondary/30 px-4 py-2 text-xs text-primary font-semibold uppercase tracking-widest">
                Swathi Thirunnal Kalakendram · Kerala
              </div>
            </div>
          </div>

          {/* Node 2 — First Franchise */}
          <div className="relative flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="md:w-1/2 md:text-right md:pr-12 md:order-1">
              <div className="inline-block bg-secondary/10 border border-secondary/30 px-4 py-2 text-xs text-primary font-semibold uppercase tracking-widest">
                Kala Kendra Kochi · Kerala
              </div>
            </div>
            <div className="relative z-10 flex-shrink-0 w-10 h-10 border-2 border-secondary bg-background rotate-45 flex items-center justify-center md:order-2">
              <div className="w-2.5 h-2.5 bg-secondary" />
            </div>
            <div className="md:w-1/2 md:pl-12 md:order-3">
              <p className="text-secondary text-xs uppercase tracking-widest font-semibold mb-1">First Franchise</p>
              <h4 className="text-2xl font-serif text-primary mb-2">Deepankuran Kaithapram</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">Son of Padmashree Kaithapram Damodaran Namboodiri, Deepankuran founded Kala Kendra Kochi — the first franchise — extending the tradition with his own artistic vision and deep musicianship.</p>
            </div>
          </div>

          {/* Node 3 — Second Franchise */}
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 md:text-right md:pr-12">
              <p className="text-secondary text-xs uppercase tracking-widest font-semibold mb-1">Second Franchise</p>
              <h4 className="text-2xl font-serif text-primary mb-2">Kala Kendra Sweden</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">Established in Gothenburg under the blessing and mentorship of Deepankuran Kaithapram — bringing Bharatanatyam, Kuchipudi, Mohiniyattam, and Carnatic Music to the Indian diaspora in Scandinavia.</p>
            </div>
            <div className="relative z-10 flex-shrink-0 w-10 h-10 border-2 border-primary bg-primary rotate-45 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-primary-foreground" />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <div className="inline-block bg-primary/10 border border-primary/30 px-4 py-2 text-xs text-primary font-semibold uppercase tracking-widest">
                Kala Kendra Sweden · Gothenburg, Est. 2009
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Padmashree Kaithapram Damodaran Namboodiri — Patron Founder */}
      <section className="py-20 px-6 md:px-12 bg-card border-y border-secondary/20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[280px_1fr] gap-16 items-center">
          <div className="flex flex-col items-center">
            <div className="gold-frame w-full max-w-[260px]">
              <img
                src="/images/kaithapuram-damodaran-namboodiri.jpg"
                alt="Padmashree Kaithapram Damodaran Namboodiri"
                className="w-full aspect-[3/4] object-cover object-top"
              />
            </div>
          </div>
          <div>
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-4 font-semibold">Founder · Swathi Thirunnal Kalakendram</p>
            <h3 className="text-4xl font-serif text-primary mb-2">Padmashree Kaithapram Damodaran Namboodiri</h3>
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">Founder, Swathi Thirunnal Kalakendram · Padmashree Awardee</p>
            <div className="h-[1px] w-16 bg-secondary/40 mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-5 text-lg">
              Padmashree Kaithapram Damodaran Namboodiri is one of India's most celebrated lyricists and a devoted patron of the classical arts. As the visionary founder of Swathi Thirunnal Kalakendram, his life-long mission has been to nurture and preserve India's rich cultural heritage — from Carnatic music and Bharatanatyam to the great literary traditions of Kerala.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              His establishment of Swathi Thirunnal Kalakendram created an institution that has shaped generations of artists. The school's ethos — rigorous classical training delivered with spiritual depth and personal mentorship — flows directly from his philosophy. Kala Kendra Sweden is honoured to carry that flame to Scandinavia.
            </p>
          </div>
        </div>
      </section>

      {/* Deepankuran Kaithapram — Founder of Kala Kendra Kochi */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_280px] gap-16 items-center">
          <div>
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-4 font-semibold">Founder · Kala Kendra Kochi</p>
            <h3 className="text-4xl font-serif text-primary mb-2">Deepankuran Kaithapram</h3>
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">Founder, Kala Kendra Kochi, Kerala · Artistic Mentor, Kala Kendra Sweden</p>
            <div className="h-[1px] w-16 bg-secondary/40 mb-6" />
            <p className="drop-cap text-muted-foreground leading-relaxed mb-5 text-lg">
              Deepankuran Kaithapram is the founder of Kala Kendra Kochi — the first franchise of Swathi Thirunnal Kalakendram — carrying forward the luminous legacy of his father, Padmashree Kaithapram Damodaran Namboodiri. Under his artistic leadership, Kala Kendra Kochi has grown into a beacon of classical arts in Kerala, nurturing generations of dancers and musicians.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-5">
              Kala Kendra Sweden is the second franchise of this prestigious lineage — a direct extension of the same tradition, the same values, and the same unbroken Guru-Shishya bond that Deepankuran embodies. A gifted musician and devoted practitioner of Carnatic music, his mentorship and blessings remain a guiding light for the Sweden chapter.
            </p>
            <blockquote className="pull-quote">
              "We are not teaching steps or notes. We are transmitting a way of seeing the world."
            </blockquote>
          </div>
          <div className="flex flex-col items-center">
            <div className="gold-frame w-full max-w-[260px]">
              <img
                src="/images/deepankuran-kaithapuram.jpg"
                alt="Deepankuran Kaithapram"
                className="w-full aspect-[3/4] object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary text-primary-foreground text-center">
        <p className="tracking-[0.3em] uppercase text-xs mb-6 text-primary-foreground/60 font-semibold">Join Us</p>
        <h3 className="text-3xl font-serif mb-4">Ready to Begin?</h3>
        <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
          The path begins with a single step. Submit an application and our team will be in touch within a few days.
        </p>
        <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-none px-10 py-6 text-lg">
          <Link href="/apply">Apply for Admission</Link>
        </Button>
      </section>

    </div>
  );
}
