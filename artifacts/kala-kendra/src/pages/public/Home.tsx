import { Link } from "wouter";
import { Button } from "@/components/ui/button";

// Assume images generated in previous steps
import bharatanatyamImg from "@/assets/images/bharatanatyam.png";
import carnaticImg from "@/assets/images/carnatic.png";

export default function Home() {
  return (
    <div className="animate-in fade-in duration-700">
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-24">
        <p className="text-secondary tracking-[0.3em] uppercase text-sm mb-6">A Tradition of Excellence</p>
        <h2 className="text-5xl md:text-7xl font-serif text-primary mb-8 max-w-4xl leading-tight">
          Preserving the Classical Arts of South India
        </h2>
        <div className="gold-divider max-w-md mx-auto" />
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-6 mb-12">
          Offering rigorous, authentic instruction in Bharatanatyam, Carnatic Music, and Kerala Arts, deeply rooted in centuries-old traditions.
        </p>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 rounded-none border border-primary/20">
          <Link href="/apply">Apply for Admission</Link>
        </Button>
      </section>

      <section className="py-24 px-6 md:px-12 lg:px-24 bg-card border-y border-secondary/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="gold-frame rotate-1 hover:rotate-0 transition-transform duration-500">
            <img src={bharatanatyamImg} alt="Bharatanatyam Dancer" className="w-full h-auto aspect-[4/5] object-cover" />
          </div>
          <div>
            <h3 className="text-4xl font-serif text-primary mb-6">Our Ethos</h3>
            <p className="drop-cap text-muted-foreground leading-relaxed mb-6">
              Kala Kendra Sweden operates not merely as a school, but as a sanctuary for the arts. Here, the relationship between Guru and Shishya (teacher and student) is sacred. We believe that mastery of classical arts requires not just physical discipline, but spiritual and emotional devotion.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We welcome students of all ages who approach learning with reverence, patience, and a willingness to immerse themselves fully in the tradition.
            </p>
            <Button asChild variant="outline" className="rounded-none border-secondary text-primary hover:bg-secondary/10">
              <Link href="/about">Read Our Philosophy</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h3 className="text-4xl font-serif text-primary mb-16">Programmes of Study</h3>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="p-8 border border-secondary/20 hover:border-secondary/60 transition-colors bg-card">
            <h4 className="text-2xl font-serif text-primary mb-4">Bharatanatyam</h4>
            <p className="text-muted-foreground mb-6">The ancient temple dance of Tamil Nadu, combining intricate footwork, expressive abhinaya, and rhythmic precision.</p>
          </div>
          <div className="p-8 border border-secondary/20 hover:border-secondary/60 transition-colors bg-card">
            <h4 className="text-2xl font-serif text-primary mb-4">Carnatic Music</h4>
            <p className="text-muted-foreground mb-6">The complex and deeply spiritual classical music system of South India, offered in both vocal and instrumental disciplines.</p>
          </div>
          <div className="p-8 border border-secondary/20 hover:border-secondary/60 transition-colors bg-card">
            <h4 className="text-2xl font-serif text-primary mb-4">Kerala Arts</h4>
            <p className="text-muted-foreground mb-6">Traditional art forms from God's Own Country, focusing on rhythmic ensembles and classical forms like Mohiniyattam.</p>
          </div>
        </div>
        <div className="mt-12">
          <Button asChild variant="ghost" className="rounded-none text-primary hover:bg-transparent hover:text-secondary underline decoration-secondary underline-offset-4">
            <Link href="/programmes">Explore All Programmes &rarr;</Link>
          </Button>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 bg-primary text-primary-foreground text-center">
        <h3 className="text-4xl font-serif mb-8">Begin Your Journey</h3>
        <div className="gold-divider max-w-xs mx-auto border-primary-foreground/30" />
        <p className="max-w-2xl mx-auto mb-10 text-primary-foreground/80">
          Admissions are open for the upcoming intake. We review each application individually to ensure students are placed in the appropriate batch.
        </p>
        <Button asChild className="bg-background text-primary hover:bg-background/90 rounded-none text-lg px-12 py-6">
          <Link href="/apply">Submit Application</Link>
        </Button>
      </section>
    </div>
  );
}
