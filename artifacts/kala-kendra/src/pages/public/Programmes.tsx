import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import carnaticImg from "@/assets/images/carnatic.png";
import keralaImg from "@/assets/images/kerala-arts.png";

const programmes = [
  {
    id: "bharatanatyam",
    title: "Bharatanatyam",
    subtitle: "Classical Dance — Tamil Nadu",
    image: "/images/bharatanatyam-real.jpg",
    intro:
      "One of the oldest and most widely practiced classical dance forms of India, originating in the temples of Tamil Nadu. It is known for its grace, sculptural poses, intricate footwork, and the power of expressive storytelling (abhinaya).",
    levels: [
      { name: "Foundation", duration: "Years 1 – 3", desc: "Adavus, shloka, Alarippu, Jatiswaram. Building the body and understanding the grammar." },
      { name: "Intermediate", duration: "Years 4 – 6", desc: "Varnam, Padams, and Javalis. Developing expressive depth and rhythmic independence." },
      { name: "Advanced", duration: "Years 7+", desc: "Thillana, solo items, and preparation for Arangetram. The complete Bharatanatyam repertoire." },
    ],
    details: [
      "Rigorous training in adavus (foundational movement units)",
      "Abhinaya — the classical grammar of expression",
      "Tala (rhythm) and raga (melody) literacy for dancers",
      "Preparation for Arangetram (solo public debut)",
      "Participation in the Annual Showcase from Year 2",
    ],
    batches: [
      "Kids Batch (Ages 4–8) — gentle introduction to rhythm and movement",
      "Junior Batch (Ages 9–14)",
      "Senior Batch (Ages 15+)",
      "Adult Batch (18+)",
    ],
    batchCode: "BHAR",
  },
  {
    id: "kuchipudi",
    title: "Kuchipudi",
    subtitle: "Classical Dance — Andhra Pradesh",
    image: "/images/bharatanatyam-real.jpg",
    intro:
      "A vibrant classical dance-drama form originating from the village of Kuchipudi in Andhra Pradesh. Renowned for its fast rhythmic footwork, graceful movements, expressive abhinaya, and the unique tradition of performing on a brass plate (tarangam). Both lyrical and athletic in equal measure.",
    levels: [
      { name: "Foundation", duration: "Years 1 – 3", desc: "Basic steps, postures, and jatis. Introduction to the Kuchipudi aesthetic and basic nritta." },
      { name: "Intermediate", duration: "Years 4 – 6", desc: "Tillana, sabdams, and short dance-drama pieces. Deepening abhinaya and layam." },
      { name: "Advanced", duration: "Years 7+", desc: "Full dance-drama roles, tarangam, and solo performance repertoire." },
    ],
    details: [
      "Classical nritta (pure dance) in the Kuchipudi tradition",
      "Abhinaya and the art of dance-drama storytelling",
      "Tarangam — the unique brass-plate balancing dance",
      "Layam (rhythmic precision) and footwork mastery",
      "Ensemble performance from Year 2 onwards",
    ],
    batches: [
      "Junior Batch (Ages 9–14)",
      "Senior Batch (Ages 15+)",
    ],
    batchCode: "KUCH",
  },
  {
    id: "mohiniyattam",
    title: "Mohiniyattam",
    subtitle: "Classical Dance — Kerala",
    image: keralaImg,
    intro:
      "The classical dance of Kerala — lyrical, graceful, and deeply feminine in its aesthetic. Characterised by gentle swaying movements, soft hand gestures, and the white-and-gold kasavu costume that sets it apart from all other classical forms. Mohiniyattam draws from the lasya (gentle) aspect of Indian classical aesthetics.",
    levels: [
      { name: "Foundation", duration: "Years 1 – 2", desc: "Atavukal (basic steps), body posture, swaying movements, and introductory cholkettu." },
      { name: "Intermediate", duration: "Years 3 – 5", desc: "Solo padams, varnam, and short compositions. Developing the distinctive Mohiniyattam lyrical quality." },
      { name: "Advanced", duration: "Years 6+", desc: "Full performance repertoire, manodharma, and stage experience." },
    ],
    details: [
      "Graceful lasya aesthetic — the softer, lyrical side of classical dance",
      "Distinctive swaying torso movements unique to Kerala",
      "Sopana sangeetham — the devotional music tradition of Kerala temples",
      "Mudras rooted in the Kerala Hastalakshana Deepika",
      "Cultural context and spiritual depth of the Mohini legend",
    ],
    batches: [
      "Junior Batch (Ages 9–14)",
      "Senior Batch (Ages 15+)",
    ],
    batchCode: "MOHI",
  },
  {
    id: "carnatic",
    title: "Carnatic Music",
    subtitle: "Vocal & Instrumental — South India",
    image: carnaticImg,
    intro:
      "The classical music system of South India — one of the oldest and most complex systems of music in the world. Highly structured, deeply devotional, and demanding of both technical rigour and intuitive freedom. Offered in both vocal and instrumental disciplines.",
    levels: [
      { name: "Foundation", duration: "Years 1 – 2", desc: "Swaras, sarali varisais, alankaras. Developing ear and voice/instrument control." },
      { name: "Intermediate", duration: "Years 3 – 5", desc: "Geetam, Swarajati, and compositions of the Musical Trinity." },
      { name: "Advanced", duration: "Years 6+", desc: "Raga alapana, neraval, kalpanaswara (manodharma). Preparation for solo kacheri." },
    ],
    details: [
      "Foundations in swaras and sarali varisais",
      "Mastery of complex ragas and talas",
      "Study of compositions by Tyagaraja, Dikshitar, and Syama Sastri",
      "Manodharma — improvisation and creative expression",
      "Ear training, shruti, and tala literacy",
    ],
    batches: [
      "Carnatic Vocal Batch",
      "Veena / Instrumental Batch",
    ],
    batchCode: "CARN",
  },
];

const faqs = [
  {
    q: "Do I need prior experience to apply?",
    a: "No. We welcome absolute beginners in all programmes. Our Foundation curriculum is designed for students with no prior background.",
  },
  {
    q: "How long before I can perform?",
    a: "Students typically participate in the Annual Showcase from their second year onwards, in ensemble pieces. An Arangetram (solo debut) is typically held in the 7th–10th year of study, when the Guru judges the student ready.",
  },
  {
    q: "Are classes available in English?",
    a: "Yes. All classes are conducted in English and Tamil. Swedish is also used where helpful.",
  },
  {
    q: "What is the commitment expected?",
    a: "Students are expected to attend all scheduled classes and to practice daily at home. Classical arts require consistency — we ask students and families to treat this as a serious long-term commitment.",
  },
  {
    q: "What are the fees?",
    a: "Monthly fees vary by batch and programme. Details are shared during the admissions process. No student is turned away for financial reasons — please contact us to discuss.",
  },
];

export default function Programmes() {
  return (
    <div className="animate-in fade-in duration-700">

      {/* Header */}
      <section className="py-28 px-6 max-w-4xl mx-auto text-center">
        <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Curriculum</p>
        <h2 className="text-5xl md:text-6xl font-serif text-primary mb-8 leading-tight">Programmes of Study</h2>
        <div className="gold-divider max-w-sm mx-auto" />
        <p className="text-xl text-muted-foreground mt-8 leading-relaxed max-w-2xl mx-auto">
          We offer four classical disciplines across multiple levels — Bharatanatyam, Kuchipudi, Mohiniyattam, and Carnatic Music. Admission is reviewed individually, and we welcome beginners as well as students seeking to deepen an existing practice.
        </p>
      </section>

      {/* Programmes */}
      <div className="space-y-0">
        {programmes.map((prog, idx) => (
          <section
            key={prog.id}
            id={prog.id}
            className={`py-24 px-6 md:px-12 ${idx % 2 === 1 ? "bg-card border-y border-secondary/20" : ""}`}
          >
            <div className="max-w-6xl mx-auto">

              {/* Header */}
              <div className="grid md:grid-cols-[2fr_1fr] gap-16 mb-16 items-end">
                <div>
                  <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-4 font-semibold">{prog.subtitle}</p>
                  <h3 className="text-4xl md:text-5xl font-serif text-primary leading-tight mb-6">{prog.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{prog.intro}</p>
                </div>
                <div className="gold-frame">
                  <img src={prog.image} alt={prog.title} className="w-full aspect-square object-cover object-top" />
                </div>
              </div>

              {/* Levels */}
              <div className="mb-16">
                <h4 className="text-xs uppercase tracking-widest text-secondary font-semibold mb-8">Curriculum Levels</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  {prog.levels.map((level) => (
                    <div key={level.name} className="border border-secondary/20 p-6 hover:border-secondary/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <p className="font-serif text-xl text-primary">{level.name}</p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">{level.duration}</p>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{level.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details + Batches */}
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-secondary font-semibold mb-6">Curriculum Highlights</h4>
                  <ul className="space-y-3">
                    {prog.details.map((detail) => (
                      <li key={detail} className="flex items-start text-muted-foreground text-sm">
                        <span className="text-secondary mr-3 mt-0.5">✦</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-secondary font-semibold mb-6">Available Batches</h4>
                  <div className="space-y-2 mb-8">
                    {prog.batches.map((batch) => (
                      <div key={batch} className="flex items-start gap-3 text-sm text-muted-foreground border-b border-secondary/10 pb-2">
                        <span className="w-2 h-2 border border-secondary/50 rotate-45 shrink-0 mt-1" />
                        {batch}
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="border-secondary text-primary hover:bg-secondary/10 rounded-none">
                    <Link href="/apply">Apply for {prog.title}</Link>
                  </Button>
                </div>
              </div>

            </div>
          </section>
        ))}
      </div>

      {/* FAQs */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Questions</p>
          <h3 className="text-4xl font-serif text-primary">Frequently Asked</h3>
        </div>
        <div className="space-y-8">
          {faqs.map((faq) => (
            <div key={faq.q} className="border-b border-secondary/20 pb-8">
              <h4 className="font-serif text-xl text-primary mb-3">{faq.q}</h4>
              <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary text-primary-foreground text-center">
        <h3 className="text-4xl font-serif mb-6">Ready to Apply?</h3>
        <p className="text-primary-foreground/80 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
          Applications are reviewed individually. Tell us about yourself and your aspirations, and we will find the right place for you.
        </p>
        <Button asChild className="bg-background text-primary hover:bg-background/90 rounded-none text-lg px-14 py-6">
          <Link href="/apply">Submit Application</Link>
        </Button>
      </section>

    </div>
  );
}
