export default function About() {
  return (
    <div className="animate-in fade-in duration-700">
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <h2 className="text-5xl font-serif text-primary mb-12 text-center">Our Lineage & Philosophy</h2>
        <div className="gold-divider" />
        <p className="drop-cap text-lg text-muted-foreground leading-relaxed mb-8">
          Kala Kendra Sweden was established to preserve and propagate the sacred arts of South India in Scandinavia. We trace our roots back through generations of Gurus who have dedicated their lives to mastery and devotion. 
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          The transmission of classical arts—Bharatanatyam, Carnatic music, and Kerala performing traditions—is not merely an academic endeavor, but a spiritual one. The relationship between teacher and student is foundational. We impart not only technique, but the ethos, devotion, and humility required to truly embody these ancient forms.
        </p>

        <blockquote className="pull-quote">
          "Art is not a performance. It is an offering. When the dancer disappears, only the dance remains."
        </blockquote>

        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Our faculty consists of senior artists who have undergone rigorous training in India under eminent masters. They bring to Gothenburg a profound understanding of the theoretical foundations (shastra) and practical applications (prayoga) of their respective disciplines.
        </p>

        <h3 className="text-3xl font-serif text-primary mt-16 mb-8">Our Guruji</h3>
        <div className="bg-card p-8 border border-secondary/20">
          <h4 className="text-2xl font-serif text-primary mb-2">Sri Ramachandran</h4>
          <p className="text-secondary text-sm uppercase tracking-widest mb-6">Founder & Artistic Director</p>
          <p className="text-muted-foreground leading-relaxed">
            With over four decades of experience in Bharatanatyam and Carnatic music, Sri Ramachandran established Kala Kendra to create an authentic space for classical arts far from their geographic origins. His pedagogy emphasizes deep emotional resonance (bhava) and strict adherence to classical grammar.
          </p>
        </div>
      </section>
    </div>
  );
}
