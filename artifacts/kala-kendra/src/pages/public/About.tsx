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

      {/* Padmashree Kaithapuram Damodaran Namboodiri — Patron Founder */}
      <section className="py-20 px-6 md:px-12 bg-card border-y border-secondary/20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[280px_1fr] gap-16 items-center">
          <div className="flex flex-col items-center">
            <div className="gold-frame w-full max-w-[260px]">
              <img
                src="/images/kaithapuram-damodaran-namboodiri.jpg"
                alt="Padmashree Kaithapuram Damodaran Namboodiri"
                className="w-full aspect-[3/4] object-cover object-top"
              />
            </div>
          </div>
          <div>
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-4 font-semibold">Patron & Inspiration</p>
            <h3 className="text-4xl font-serif text-primary mb-2">Padmashree Kaithapuram Damodaran Namboodiri</h3>
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">Founder, Kala Kendra · Padmashree Awardee</p>
            <div className="h-[1px] w-16 bg-secondary/40 mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-5 text-lg">
              Padmashree Kaithapuram Damodaran Namboodiri is one of India's most celebrated lyricists and a devoted patron of the classical arts. As the visionary founder of Kala Kendra, his life-long mission has been to nurture and preserve India's rich cultural heritage — from Carnatic music and Bharatanatyam to the great literary traditions of Kerala.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              His establishment of Kala Kendra created an institution that has shaped generations of artists. The school's ethos — rigorous classical training delivered with spiritual depth and personal mentorship — flows directly from his philosophy. Kala Kendra Sweden is honoured to carry that flame to Scandinavia.
            </p>
          </div>
        </div>
      </section>

      {/* Deepankuran Kaithapuram — Founder of Kala Kendra Sweden */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_280px] gap-16 items-center">
          <div>
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-4 font-semibold">Founder · Kala Kendra Sweden</p>
            <h3 className="text-4xl font-serif text-primary mb-2">Deepankuran Kaithapuram</h3>
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">Artistic Director · First Franchise of Kala Kendra</p>
            <div className="h-[1px] w-16 bg-secondary/40 mb-6" />
            <p className="drop-cap text-muted-foreground leading-relaxed mb-5 text-lg">
              Deepankuran Kaithapuram is the founder of Kala Kendra Sweden — the first international franchise of the celebrated Kala Kendra institution. Carrying forward the legacy of his father, Padmashree Kaithapuram Damodaran Namboodiri, Deepankuran established the school in Gothenburg with a singular commitment: to bring authentic, lineage-rooted classical arts training to the Indian diaspora in Scandinavia.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-5">
              A gifted musician and devoted practitioner of Carnatic classical music, Deepankuran's teaching brings together technical mastery and the warmth of a true Guru. He believes that art must be lived, not merely performed — and that the discipline of classical study shapes not just artists but human beings.
            </p>
            <blockquote className="pull-quote">
              "We are not teaching steps or notes. We are transmitting a way of seeing the world."
            </blockquote>
          </div>
          <div className="flex flex-col items-center">
            <div className="gold-frame w-full max-w-[260px]">
              <img
                src="/images/deepankuran-kaithapuram.jpg"
                alt="Deepankuran Kaithapuram"
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
