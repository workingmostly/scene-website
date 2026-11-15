import FriendsCalendar from "./mock/FriendsCalendar";
import TicketScanner from "./mock/TicketScanner";
import StubCollection from "./mock/StubCollection";

const features = [
  {
    tag: "Bring your friends",
    title: "All your gigs in one place.",
    description:
      "No more \"Where did that ticket go?\". Keep them all in one shared calendar with your friends. It even syncs with Google Calendar.",
  },
  {
    tag: "Add Tickets",
    title: "No need to add them yourself.",
    description:
      "Scan tickets or import an email. Supports DICE, Ticketmaster, SeeTickets, Headfirst and more.",
  },
  {
    tag: "Collect Stubs",
    title: "Remember every show.",
    description:
      "Collect tickets, review shows and share it all with your friends.",
  },
];

function Copy({ f, size = "md" }: { f: (typeof features)[number]; size?: "lg" | "md" }) {
  return (
    <div className="reveal-child" style={{ ["--i" as string]: 0 }}>
      <p className="eyebrow text-scene-accent">{f.tag}</p>
      <h3 className={`display mt-4 text-white ${size === "lg" ? "text-[2.1rem] sm:text-[2.6rem]" : "text-[2rem] sm:text-[2.25rem]"}`}>
        {f.title}
      </h3>
      <p className="mt-4 max-w-md text-[17px] leading-relaxed text-scene-muted">{f.description}</p>
    </div>
  );
}

export default function FeatureGrid() {
  const [friends, tickets, stubs] = features;

  return (
    <section id="features" className="px-3 pt-10 sm:px-4 sm:pt-16" style={{ scrollMarginTop: "96px" }}>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {/* ── Lead card: copy left, the shared calendar right ── */}
        <article className="reveal grid overflow-hidden rounded-card bg-scene-surface md:col-span-2 md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 pb-2 sm:p-11 md:pb-11">
            <Copy f={friends} size="lg" />
          </div>
          <div className="reveal-child flex items-center justify-center px-6 py-8 sm:px-10 sm:py-14" style={{ ["--i" as string]: 1 }}>
            <FriendsCalendar />
          </div>
        </article>

        {/* ── Add tickets: the email reads itself ── */}
        <article className="reveal flex flex-col overflow-hidden rounded-card bg-scene-surface">
          <div className="p-8 pb-4 sm:p-11 sm:pb-6">
            <Copy f={tickets} />
          </div>
          <div className="reveal-child px-6 pb-8 sm:px-11 sm:pb-12" style={{ ["--i" as string]: 1 }}>
            <TicketScanner />
          </div>
        </article>

        {/* ── Collect stubs: stamp to rate ── */}
        <article className="reveal flex flex-col overflow-hidden rounded-card bg-scene-surface">
          <div className="p-8 pb-4 sm:p-11 sm:pb-6">
            <Copy f={stubs} />
          </div>
          <div className="reveal-child px-6 pb-8 sm:px-11 sm:pb-12" style={{ ["--i" as string]: 1 }}>
            <StubCollection />
          </div>
        </article>
      </div>
    </section>
  );
}
