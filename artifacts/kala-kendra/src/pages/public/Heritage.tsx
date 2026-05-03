import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import carnaticImg from "@/assets/images/carnatic.png";

const traditions = [
  {
    id: "bharatanatyam",
    title: "Bharatanatyam",
    origin: "Tamil Nadu",
    age: "2,000+ years",
    img: "/images/bharatanatyam-real.jpg",
    sections: [
      {
        heading: "Origins in the Temple",
        body: "Bharatanatyam finds its earliest roots in the devotional practice of the devadasis — women dedicated to the deity of a temple, whose dances were acts of worship rather than performance. The form is codified in the Natya Shastra, composed by the sage Bharata Muni around the 2nd century BCE, making it one of the oldest systematic accounts of performance art in the world.",
      },
      {
        heading: "Grammar of the Body",
        body: "The discipline rests on a precise grammar: nritta (pure rhythmic movement), nritya (expressive storytelling), and natya (dramatic enactment). The adavus — fundamental units of footwork and posture — number in the dozens, and mastery of them alone requires years of daily practice. The hands (mudras), eyes (drishti), and facial expressions (abhinaya) form a complete language capable of narrating the entire range of human and divine experience.",
      },
      {
        heading: "The Arangetram",
        body: "The Arangetram — literally 'ascending the stage' — marks a student's first solo public recital and is among the most sacred milestones in a classical dancer's life. It typically occurs after seven to ten years of dedicated training and is a formal declaration of the student's readiness to carry the tradition forward.",
      },
    ],
  },
  {
    id: "kuchipudi",
    title: "Kuchipudi",
    origin: "Andhra Pradesh",
    age: "600+ years",
    img: "/images/kuchipudi-real.jpg",
    sections: [
      {
        heading: "Village of Dancers",
        body: "Kuchipudi takes its name from the village of Kuchipudi in Andhra Pradesh, where Brahmin men performed dance-dramas in honour of Lord Krishna. The form was codified in the 17th century by the saint-poet Siddhendra Yogi, who shaped it into the Bhama Kalapam — a dance-drama in which a woman's longing for Krishna is expressed through abhinaya of extraordinary depth.",
      },
      {
        heading: "Dance and Drama United",
        body: "Kuchipudi is unique among Indian classical forms in its seamless integration of pure dance (nritta), expressive storytelling (nritya), and dramatic enactment (natya). The performer must be at once an athlete, actor, and musician — able to sing while dancing, to shift instantly between abstract rhythm and emotional narrative, and to sustain both technical and emotional demands simultaneously.",
      },
      {
        heading: "Tarangam — The Brass Plate Dance",
        body: "Among Kuchipudi's most spectacular traditions is the tarangam — in which the dancer balances on the rim of a brass plate while executing precise rhythmic sequences, arms extended, face radiant. Performed to compositions in praise of Lord Krishna, the tarangam requires extraordinary balance, concentration, and years of dedicated practice to master.",
      },
    ],
  },
  {
    id: "mohiniyattam",
    title: "Mohiniyattam",
    origin: "Kerala",
    age: "400+ years",
    img: "/images/mohiniyattam-real.jpg",
    sections: [
      {
        heading: "Dance of the Enchantress",
        body: "Mohiniyattam — 'the dance of Mohini, the enchantress' — is the classical dance of Kerala. Unlike the vigorous tandava of Bharatanatyam, Mohiniyattam embodies the lasya aesthetic: soft, swaying, lyrical. It draws on the legend of Mohini, the female avatar of Vishnu, and is performed exclusively by women in costumes of white and gold — the colours of the Kerala tradition.",
      },
      {
        heading: "The Lasya Aesthetic",
        body: "The distinctive feature of Mohiniyattam is its swaying, circular torso movement — the idakkai — which gives it a quality of gentle undulation that no other classical form possesses. The mudras are drawn from the Kerala Hastalakshana Deepika rather than the Natyashastra, giving the hand gestures a distinct regional identity. The overall effect is one of devotional tenderness and spiritual surrender.",
      },
      {
        heading: "Sopana Sangeetham",
        body: "Mohiniyattam is performed to Sopana sangeetham — the devotional music of the Kerala temple steps — rather than Carnatic music. This gives the form its unique sonic character: slow, contemplative, rooted in temple devotion. The compositions (padam, churnika, shlokam) draw from Sanskrit and Malayalam devotional literature, evoking the full range of divine love.",
      },
    ],
  },
  {
    id: "carnatic",
    title: "Carnatic Music",
    origin: "South India",
    age: "1,500+ years",
    img: carnaticImg,
    sections: [
      {
        heading: "A Science of Sound",
        body: "Carnatic music is one of two main subgenres of Indian classical music, the other being Hindustani. It is built on a system of ragas (melodic frameworks) and talas (rhythmic cycles) of extraordinary complexity and beauty. The tradition prizes both precision of grammar and freedom of improvisation — the manodharma, or creative imagination, of the performer.",
      },
      {
        heading: "The Musical Trinity",
        body: "The 18th-century composers Tyagaraja, Muthuswami Dikshitar, and Syama Sastri — known as the Musical Trinity — form the canonical core of the Carnatic repertoire. Their compositions, set in ragas of great depth and beauty, are studies in devotional music and remain the standard against which all Carnatic musicians are measured.",
      },
      {
        heading: "The Kacheri Tradition",
        body: "A classical Carnatic concert (kacheri) typically begins with a Varnam — a structured, fast-paced piece that establishes the evening's primary raga — before moving through a series of compositions, each elaborating a different raga, and culminating in a Tillana of rhythmic joy. The tradition demands both technical precision and emotional spontaneity.",
      },
    ],
  },
];

export default function Heritage() {
  return (
    <div className="animate-in fade-in duration-700">

      {/* Header */}
      <section className="py-28 px-6 max-w-4xl mx-auto text-center">
        <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Tradition</p>
        <h2 className="text-5xl md:text-6xl font-serif text-primary mb-8 leading-tight">
          The Heritage of Classical South Indian Arts
        </h2>
        <div className="gold-divider max-w-sm mx-auto" />
        <p className="text-xl text-muted-foreground mt-8 leading-relaxed max-w-2xl mx-auto">
          The arts we teach are not simply disciplines — they are living transmissions of philosophy, devotion, and beauty, refined over thousands of years and passed from teacher to student in an unbroken chain.
        </p>
      </section>

      {/* Epigraph */}
      <section className="py-12 px-6 bg-card border-y border-secondary/20">
        <div className="max-w-3xl mx-auto">
          <blockquote className="pull-quote text-center border-none text-3xl leading-relaxed">
            "Na cha vidyā samam chakṣuḥ" — There is no eye equal to knowledge.
          </blockquote>
          <p className="text-center text-muted-foreground text-sm mt-4">— Sanskrit Subhashita</p>
        </div>
      </section>

      {/* Traditions */}
      {traditions.map((tradition, idx) => (
        <section
          key={tradition.id}
          id={tradition.id}
          className={`py-24 px-6 md:px-12 ${idx % 2 === 1 ? "bg-card border-y border-secondary/20" : ""}`}
        >
          <div className="max-w-6xl mx-auto">
            {/* Title block */}
            <div className="grid md:grid-cols-[1fr_2fr] gap-16 mb-16 items-end">
              <div>
                <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-4 font-semibold">{tradition.origin}</p>
                <h3 className="text-4xl md:text-5xl font-serif text-primary leading-tight">{tradition.title}</h3>
                <div className="h-[1px] w-16 bg-secondary/40 mt-6" />
                <p className="text-muted-foreground text-sm mt-4">{tradition.age} of documented tradition</p>
              </div>
              <div className="gold-frame">
                <img
                  src={tradition.img}
                  alt={tradition.title}
                  className="w-full aspect-[3/4] object-cover object-top"
                />
              </div>
            </div>

            {/* Content sections */}
            <div className="grid md:grid-cols-3 gap-10">
              {tradition.sections.map((sec) => (
                <div key={sec.heading} className="border-t border-secondary/20 pt-8">
                  <h4 className="font-serif text-xl text-primary mb-4">{sec.heading}</h4>
                  <p className="text-muted-foreground leading-relaxed text-sm">{sec.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Why it matters in Sweden */}
      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <p className="tracking-[0.3em] uppercase text-xs mb-6 text-primary-foreground/60 font-semibold">Why Gothenburg</p>
          <h3 className="text-4xl font-serif mb-8">Why This Matters Here</h3>
          <p className="text-primary-foreground/85 text-lg leading-relaxed mb-6">
            Classical Indian arts have never belonged to a single geography. They belong to whoever has the devotion to carry them. The Indian diaspora in Scandinavia has built vibrant communities — and those communities deserve access to the same depth of classical training that exists in Chennai, Kolkata, or Trivandrum.
          </p>
          <p className="text-primary-foreground/75 leading-relaxed mb-12">
            Kala Kendra Sweden exists to ensure that children growing up in Gothenburg can receive the same quality of Guru-Shishya transmission as those studying in India — and that the tradition loses nothing in crossing the ocean.
          </p>
          <Button asChild className="bg-background text-primary hover:bg-background/90 rounded-none px-10 py-6 text-lg">
            <Link href="/apply">Apply for Admission</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
