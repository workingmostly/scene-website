const features = [
  {
    tag: "Bring your friends",
    title: "All your gigs in one place.",
    description:
      "No more \"Where did that ticket go?\". Keep them all in one shared calendar with your friends. It even syncs with Google Calendar.",
    screenshot: "/screenshots/home.png",
    alt: "Scene app — My Gigs calendar view",
  },
  {
    tag: "Add Tickets",
    title: "No need to add them yourself.",
    description:
      "Scan tickets or import an email. Supports DICE, Ticketmaster, SeeTickets, Headfirst and more.",
    screenshot: "/screenshots/add-gig.png",
    alt: "Scene app — add a gig",
  },
  {
    tag: "Collect Stubs",
    title: "Remember every show.",
    description:
      "Collect tickets, review shows and share it all with your friends.",
    screenshot: "/screenshots/profile.png",
    alt: "Scene app — profile",
  },
];

function Phone({
  src,
  alt,
  width,
  rotate = 0,
}: {
  src: string;
  alt: string;
  width: number;
  rotate?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        width,
        maxWidth: "80vw",
        height: "auto",
        display: "block",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.6))",
      }}
    />
  );
}

export default function FeatureGrid() {
  const [lead, ...rest] = features;

  return (
    <section
      id="features"
      className="px-3 pt-10 sm:px-4 sm:pt-16"
      style={{ scrollMarginTop: "96px" }}
    >
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {/* ── Lead card: text left, phone right ── */}
        <article className="reveal grid overflow-hidden rounded-card bg-scene-surface md:col-span-2 md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 pb-4 sm:p-11 md:pb-11">
            <p className="eyebrow text-scene-accent">{lead.tag}</p>
            <h3 className="display mt-4 text-[2.1rem] text-white sm:text-[2.6rem]">
              {lead.title}
            </h3>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-scene-muted">
              {lead.description}
            </p>
          </div>
          <div className="relative flex items-start justify-center px-6 pt-8 sm:px-10 sm:pt-12 md:pt-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 70%, rgba(255,255,255,0.05) 0%, transparent 70%)",
              }}
            />
            <div className="relative -mb-24 sm:-mb-32" style={{ maxHeight: 420, overflow: "hidden" }}>
              <Phone src={lead.screenshot} alt={lead.alt} width={300} rotate={-3} />
            </div>
          </div>
        </article>

        {/* ── Two stacked cards: text on top, phone below ── */}
        {rest.map((f, i) => (
          <article
            key={f.tag}
            className="reveal flex flex-col overflow-hidden rounded-card bg-scene-surface"
          >
            <div className="p-8 pb-4 sm:p-11 sm:pb-6">
              <p className="eyebrow text-scene-accent">{f.tag}</p>
              <h3 className="display mt-4 text-[2rem] text-white sm:text-[2.25rem]">
                {f.title}
              </h3>
              <p className="mt-4 max-w-md text-[17px] leading-relaxed text-scene-muted">
                {f.description}
              </p>
            </div>
            <div className="relative mt-auto flex justify-center px-6 pt-4 sm:px-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 50% at 50% 80%, rgba(255,255,255,0.05) 0%, transparent 70%)",
                }}
              />
              <div className="relative" style={{ height: 380, overflow: "hidden" }}>
                <Phone src={f.screenshot} alt={f.alt} width={280} rotate={i === 0 ? 2 : -2} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
