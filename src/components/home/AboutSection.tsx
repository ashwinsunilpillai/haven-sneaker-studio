export function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-[100rem] scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-10 border-t border-border pt-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <h2 className="display text-[clamp(2.5rem,6vw,4.5rem)]">ABOUT HAVEN</h2>
        <div className="space-y-6">
          <p className="text-lg leading-relaxed text-foreground md:text-xl">
            Haven is built for people who see sneakers as more than just something you wear.
            Discover carefully selected pairs, find your next favourite silhouette, and compete for
            exclusive sneakers through live auctions.
          </p>
          <dl className="grid grid-cols-2 gap-6 border-t border-border pt-6 sm:grid-cols-3">
            <div>
              <dt className="eyebrow text-muted-foreground">Authentication</dt>
              <dd className="display mt-1 text-3xl">100%</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Pairs listed</dt>
              <dd className="display mt-1 text-3xl">12K+</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Auctions weekly</dt>
              <dd className="display mt-1 text-3xl">40+</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
