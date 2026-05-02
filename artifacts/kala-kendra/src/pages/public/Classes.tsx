import { Link } from "wouter";
import { useListBatches, getListBatchesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, ArrowRight } from "lucide-react";

function CapacityBar({ enrolled, max }: { enrolled: number; max: number }) {
  const pct = Math.min(100, Math.round((enrolled / max) * 100));
  const full = enrolled >= max;
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
        <span>{enrolled} enrolled</span>
        <span className={full ? "text-amber-700 font-medium" : ""}>{full ? "Full" : `${max - enrolled} place${max - enrolled !== 1 ? "s" : ""} remaining`}</span>
      </div>
      <div className="h-0.5 bg-secondary/15 w-full">
        <div
          className={`h-0.5 transition-all ${full ? "bg-amber-600" : "bg-secondary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Classes() {
  const { data: batches, isLoading } = useListBatches({
    query: {
      queryKey: getListBatchesQueryKey({ active: true }),
      select: (data) => data.filter((b) => b.active).sort((a, b) => a.displayOrder - b.displayOrder),
    },
    active: true,
  });

  return (
    <div className="animate-in fade-in duration-700">

      {/* Hero */}
      <section className="py-28 px-6 max-w-4xl mx-auto text-center">
        <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Schedule</p>
        <h2 className="text-5xl md:text-6xl font-serif text-primary mb-8 leading-tight">Current Classes</h2>
        <div className="gold-divider max-w-sm mx-auto" />
        <p className="text-xl text-muted-foreground mt-8 leading-relaxed max-w-2xl mx-auto">
          Our classes are small by design — each batch is capped to allow individual attention from the Guru.
          Below are all currently active batches with their schedules.
        </p>
      </section>

      {/* Batch grid */}
      <section className="py-4 pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-secondary/20 bg-card p-8 space-y-4">
                  <Skeleton className="h-5 w-1/3 bg-secondary/15" />
                  <Skeleton className="h-7 w-3/4 bg-secondary/15" />
                  <Skeleton className="h-4 w-full bg-secondary/15" />
                  <Skeleton className="h-4 w-2/3 bg-secondary/15" />
                </div>
              ))}
            </div>
          ) : !batches || batches.length === 0 ? (
            <div className="text-center py-20 border border-secondary/20 bg-card">
              <p className="font-serif text-2xl text-primary mb-3">No classes listed at this time</p>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Please contact us directly — we can advise on upcoming batches and enrolment opportunities.
              </p>
              <Button asChild variant="outline" className="border-secondary text-primary hover:bg-secondary/10 rounded-none mt-8">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batches.map((batch) => {
                const isFull = batch.maxStudents != null && batch.studentCount >= batch.maxStudents;
                return (
                  <div
                    key={batch.id}
                    className="border border-secondary/20 bg-card p-8 flex flex-col hover:border-secondary/50 transition-colors"
                  >
                    {/* Top meta */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        {batch.ageRange && (
                          <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-2">
                            {batch.ageRange}
                          </p>
                        )}
                        <h3 className="font-serif text-2xl text-primary leading-tight">{batch.name}</h3>
                      </div>
                      {isFull && (
                        <span className="shrink-0 mt-1 text-[10px] uppercase tracking-widest font-semibold border border-amber-600/50 text-amber-700 px-2 py-0.5">
                          Full
                        </span>
                      )}
                    </div>

                    {/* Schedule */}
                    {batch.schedule ? (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                        <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-secondary" />
                        <span className="leading-snug">{batch.schedule}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic mb-3">Schedule on application</p>
                    )}

                    {/* Description */}
                    {batch.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                        {batch.description}
                      </p>
                    )}

                    {/* Capacity */}
                    {batch.maxStudents != null ? (
                      <div className="mt-auto">
                        <CapacityBar enrolled={batch.studentCount} max={batch.maxStudents} />
                      </div>
                    ) : (
                      <div className="mt-auto pt-4 border-t border-secondary/10 flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{batch.studentCount} enrolled</span>
                      </div>
                    )}

                    {/* Apply CTA */}
                    <div className="mt-6">
                      {isFull ? (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full rounded-none border-secondary/30 text-muted-foreground text-sm"
                        >
                          <Link href="/contact">Join Waitlist</Link>
                        </Button>
                      ) : (
                        <Button
                          asChild
                          className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-sm gap-2"
                        >
                          <Link href={`/apply?batch=${encodeURIComponent(batch.name)}`}>
                            Apply for This Batch <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Info strip */}
      <section className="bg-card border-y border-secondary/20 py-16 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3">Commitment</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Classes run through the academic year. We ask for consistency — classical arts reward long-term dedication.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3">Class Sizes</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Each batch is deliberately small. This allows the Guru to work closely with every student and track individual progress.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3">Fees</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Monthly fees are communicated during the admissions process. No student is turned away for financial reasons.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary text-primary-foreground text-center">
        <h3 className="text-4xl font-serif mb-6">Not Sure Which Batch to Apply For?</h3>
        <p className="text-primary-foreground/80 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
          Write to us and describe your background and interests. We will recommend the right placement for you.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild className="bg-background text-primary hover:bg-background/90 rounded-none text-sm px-10 py-5">
            <Link href="/apply">Submit Application</Link>
          </Button>
          <Button asChild variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 rounded-none text-sm px-10 py-5">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
