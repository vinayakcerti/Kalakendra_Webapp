export default function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in max-w-2xl">
      <h2 className="text-3xl font-serif text-primary">Settings</h2>
      
      <div className="bg-card border border-secondary/20 p-8">
        <h3 className="font-serif text-xl text-primary mb-6">Institution Details</h3>
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary mb-1">Name</p>
            <p className="text-lg">Kala Kendra Sweden</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary mb-1">Email</p>
            <p className="text-lg">namaskaram@kalakendra.se</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary mb-1">Academic Year</p>
            <p className="text-lg">2024-2025</p>
          </div>
        </div>
        
        <div className="gold-divider my-8" />
        
        <p className="text-muted-foreground text-sm italic">
          Additional settings functionality is restricted in this environment.
        </p>
      </div>
    </div>
  );
}
