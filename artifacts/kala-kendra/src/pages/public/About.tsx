import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import bharatanatyamImg from "@/assets/images/bharatanatyam.png";

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

const faculty = [
  {
    name: "Sri Ramachandran Iyer",
    title: "Founder & Artistic Director",
    discipline: "Bharatanatyam & Carnatic Vocal",
    bio: "Trained under Padmashri Smt. Alarmel Valli and Sri T.V. Gopalakrishnan in Chennai, Sri Ramachandran has devoted over four decades to the classical arts. He established Kala Kendra Sweden in 2009 with a single conviction: that authentic classical teaching belongs wherever devoted students exist.",
  },
  {
    name: "Smt. Geetha Krishnaswamy",
    title: "Senior Faculty",
    discipline: "Bharatanatyam",
    bio: "A disciple of the Pandanallur style, Smt. Geetha brings extraordinary precision to her teaching. She has conducted more than thirty Arangetrams and is known for her patient, exacting approach to abhinaya.",
  },
  {
    name: "Sri Venkatesh Subramaniam",
    title: "Faculty — Music",
    discipline: "Carnatic Vocal & Veena",
    bio: "Sri Venkatesh studied at the Music College in Thiruvananthapuram before joining Kala Kendra. His teaching weaves together the theoretical (shastra) and the intuitive (manodharma) in equal measure.",
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
            <img src={bharatanatyamImg} alt="Bharatanatyam" className="w-full h-auto aspect-[4/5] object-cover" />
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

      {/* Our Guruji */}
      <section className="py-16 px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <p className="tracking-[0.3em] uppercase text-xs mb-6 text-primary-foreground/60 font-semibold">Founder</p>
          <h3 className="text-4xl font-serif mb-4">Sri Ramachandran Iyer</h3>
          <p className="text-primary-foreground/70 text-sm uppercase tracking-widest mb-8">Artistic Director & Chief Guru</p>
          <div className="h-[1px] w-24 bg-primary-foreground/20 mx-auto mb-8" />
          <p className="text-primary-foreground/85 text-lg leading-relaxed mb-6">
            Trained under Padmashri Smt. Alarmel Valli and Sri T.V. Gopalakrishnan in Chennai, Sri Ramachandran has devoted over four decades to the classical arts. He established Kala Kendra Sweden in 2009 with a single conviction: that authentic classical teaching belongs wherever devoted students exist.
          </p>
          <p className="text-primary-foreground/75 leading-relaxed">
            His pedagogy emphasises deep emotional resonance (bhava) and strict adherence to classical grammar. He has guided over two hundred students on their path, many of whom have gone on to perform professionally in India, Sweden, and beyond.
          </p>
        </div>
      </section>

      {/* Faculty */}
      <section className="py-28 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Our Teachers</p>
          <h3 className="text-4xl font-serif text-primary">The Faculty</h3>
        </div>
        <div className="space-y-8">
          {faculty.map((member) => (
            <div key={member.name} className="bg-card border border-secondary/20 p-8 md:p-10 grid md:grid-cols-[200px_1fr] gap-8">
              <div>
                <h4 className="text-2xl font-serif text-primary mb-2">{member.name}</h4>
                <p className="text-secondary text-xs uppercase tracking-widest mb-1">{member.title}</p>
                <p className="text-muted-foreground text-xs">{member.discipline}</p>
              </div>
              <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-card border-t border-secondary/20 text-center">
        <h3 className="text-3xl font-serif text-primary mb-4">Ready to Begin?</h3>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          The path begins with a single step. Submit an application and our team will be in touch.
        </p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 py-6 text-lg">
          <Link href="/apply">Apply for Admission</Link>
        </Button>
      </section>

    </div>
  );
}
