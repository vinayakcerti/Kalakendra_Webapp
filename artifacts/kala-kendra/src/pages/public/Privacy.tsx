const sections = [
  {
    title: "Who We Are",
    body: `Kala Kendra Sweden is a classical Indian arts school based in Gothenburg, Sweden. We are a private cultural organisation, not a limited company, and we operate as an arts education provider. Our contact address is: namaskaram@kalakendra.se.`,
  },
  {
    title: "What Data We Collect",
    body: `We collect personal data when you:
    
• Submit an admission application — including name, date of birth, address, contact details, parent/guardian information, and information about prior arts experience.
• Send a contact form or enquiry — including name, email address, and the content of your message.
• Are enrolled as a student — including attendance records, payment records, and Guru's notes on progress.

We do not collect sensitive data (such as health or biometric data) except where you voluntarily provide it in the context of an application (e.g. noting a disability relevant to classes). We do not engage in automated decision-making or profiling.`,
  },
  {
    title: "Why We Process Your Data",
    body: `We process your personal data for the following purposes:

• To assess admission applications and communicate with prospective students and families.
• To maintain student records for the purpose of administering classes, tracking attendance, and communicating about the school's activities.
• To respond to general enquiries.
• To comply with our legal obligations.

Our lawful basis for processing is: (a) your consent, provided when you submit a form; and (b) the performance of a contract or pre-contractual steps (for enrolled students).`,
  },
  {
    title: "Who We Share Your Data With",
    body: `We do not sell or trade your personal data. We may share it with:

• Service providers who help us operate our systems (e.g. our web hosting provider), under strict data processing agreements.
• If required, regulatory authorities or law enforcement, where we have a legal obligation to do so.

We do not share your data with other third parties without your explicit consent.`,
  },
  {
    title: "How Long We Keep Your Data",
    body: `Admission applications from applicants who are not accepted are deleted after 12 months. Student records are retained for the duration of enrolment and for 5 years thereafter, for administrative purposes. Contact form submissions are retained for 24 months.`,
  },
  {
    title: "Your Rights Under GDPR",
    body: `As a data subject in the European Union (EU) / European Economic Area (EEA), you have the following rights:

• Right of access — to request a copy of the personal data we hold about you.
• Right to rectification — to request correction of inaccurate data.
• Right to erasure — to request deletion of your data, subject to our legal obligations.
• Right to restriction — to request that we restrict processing of your data.
• Right to object — to object to our processing of your data for certain purposes.
• Right to data portability — to receive your data in a structured, machine-readable format.

To exercise any of these rights, please contact us at namaskaram@kalakendra.se. We will respond within 30 days.`,
  },
  {
    title: "Cookies",
    body: `Our website uses only technically necessary cookies (session cookies) for the operation of the site. We do not use tracking cookies, advertising cookies, or third-party analytics. No cookie consent is required for technically necessary cookies.`,
  },
  {
    title: "Security",
    body: `We take the security of your personal data seriously. Our systems use HTTPS encryption, and access to our administrative systems is restricted to authorised personnel only. In the event of a data breach affecting your rights, we will notify you and the relevant supervisory authority (Integritetsskyddsmyndigheten, IMY) as required by law.`,
  },
  {
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. Any changes will be published on this page with the date of last revision shown above. We encourage you to review this policy periodically.`,
  },
  {
    title: "Contact & Complaints",
    body: `If you have any questions about this policy or about how we handle your personal data, please contact us at namaskaram@kalakendra.se.

If you are not satisfied with our response, you have the right to lodge a complaint with the Swedish supervisory authority: Integritetsskyddsmyndigheten (IMY), imy.se.`,
  },
];

export default function Privacy() {
  const lastUpdated = "2 May 2026";

  return (
    <div className="animate-in fade-in duration-700">
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-5xl font-serif text-primary mb-4 text-center">Privacy Policy</h2>
        <p className="text-center text-muted-foreground mb-2 text-sm">Kala Kendra Sweden</p>
        <p className="text-center text-muted-foreground mb-12 text-sm">Last updated: {lastUpdated}</p>

        <div className="gold-divider" />

        <p className="text-muted-foreground leading-relaxed mt-8 mb-12">
          This Privacy Policy explains how Kala Kendra Sweden collects, uses, stores, and protects personal data submitted through this website or through our admissions process. We are committed to compliance with the General Data Protection Regulation (GDPR — EU 2016/679) and applicable Swedish data protection law.
        </p>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <div key={section.title} className="border-t border-secondary/20 pt-8">
              <h3 className="text-2xl font-serif text-primary mb-4">
                <span className="text-secondary/40 mr-3 font-mono text-sm">{String(idx + 1).padStart(2, "0")}.</span>
                {section.title}
              </h3>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                {section.body}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-card border border-secondary/20 p-6 text-center">
          <p className="text-muted-foreground text-sm">
            For any questions about this policy, contact us at{" "}
            <a href="mailto:namaskaram@kalakendra.se" className="text-primary underline underline-offset-2">
              namaskaram@kalakendra.se
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
