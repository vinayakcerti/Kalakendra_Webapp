import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const programmes = [
  {
    id: "bharatanatyam",
    title: "Bharatanatyam",
    description: "One of the oldest and most widely practiced classical dance forms of India, originating in the temples of Tamil Nadu. It is known for its grace, purity, tenderness, and sculptural poses.",
    details: [
      "Rigorous training in adavus (basic steps)",
      "Study of abhinaya (expressive storytelling)",
      "Understanding of tala (rhythm) and raga (melody)",
      "Preparation for Arangetram (solo debut)"
    ]
  },
  {
    id: "carnatic-vocal",
    title: "Carnatic Vocal",
    description: "The classical music system of South India, considered one of the oldest systems of music in the world. It is highly structured and demands deep devotion and rigorous practice.",
    details: [
      "Foundation in swaras and sarali varisais",
      "Mastery of complex ragas and talas",
      "Study of compositions by the Trinity",
      "Manodharma (improvisation) techniques"
    ]
  },
  {
    id: "carnatic-instrumental",
    title: "Carnatic Instrumental",
    description: "Training in traditional instruments that accompany or perform solo in the Carnatic style, focusing on the Veena and the Mridangam.",
    details: [
      "Technique and posture for the specific instrument",
      "Translating vocal nuances (gayaki anga) to strings/percussion",
      "Rhythmic accompaniment patterns",
      "Solo concert preparation"
    ]
  },
  {
    id: "kerala-arts",
    title: "Kerala Arts",
    description: "A specialized programme introducing the rhythmic and performative traditions of Kerala, including Mohiniyattam and traditional percussion ensembles.",
    details: [
      "Graceful, swaying movements of Mohiniyattam",
      "Study of Kerala's unique rhythmic structures (talams)",
      "Introduction to traditional instruments like the Chenda",
      "Cultural context of temple festivals"
    ]
  }
];

export default function Programmes() {
  return (
    <div className="animate-in fade-in duration-700">
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-5xl font-serif text-primary mb-6 text-center">Programmes of Study</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          We offer comprehensive, multi-year programmes in four distinct disciplines. Admission is subject to review, and we welcome absolute beginners as well as advanced students seeking to refine their art.
        </p>
        
        <div className="space-y-16">
          {programmes.map((prog) => (
            <div key={prog.id} className="grid md:grid-cols-3 gap-8 bg-card border border-secondary/20 p-8 md:p-12 hover:border-secondary/50 transition-colors">
              <div className="md:col-span-1">
                <h3 className="text-3xl font-serif text-primary mb-4">{prog.title}</h3>
                <div className="h-[1px] w-16 bg-secondary/40 mb-6" />
              </div>
              <div className="md:col-span-2">
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  {prog.description}
                </p>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-secondary mb-4">Curriculum Highlights</h4>
                <ul className="space-y-3 mb-8">
                  {prog.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start text-muted-foreground">
                      <span className="text-secondary mr-3">✦</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="border-secondary text-primary hover:bg-secondary/10 rounded-none">
                  <Link href={`/apply?programme=${prog.id}`}>Apply for {prog.title}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
