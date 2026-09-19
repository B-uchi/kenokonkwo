import type { Metadata } from "next";
import RsvpModal from "../rsvp-modal";

export const metadata: Metadata = {
  title: "Service & Venues",
};

type Event = {
  name: string;
  date?: { weekday: string; day: string; month: string; full: string };
  times: string[];
  venue?: { name: string; lines: string[] };
  /** short place label for the map-less location panel */
  region?: { title: string; subtitle: string };
  /** Google Maps embed src */
  embed?: string;
  /** search query for "Get directions" when there is no embed */
  mapsQuery?: string;
  note?: string;
};

const mapsLink = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const usEvents: Event[] = [
  {
    name: "Service of Songs",
    date: { weekday: "Fri", day: "9", month: "Oct 2026", full: "Friday, 9 October 2026" },
    times: ["6:00 PM"],
    venue: { name: "Radisson Hotel", lines: ["Grand Ballroom", "Hauppauge, NY"] },
    embed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2992.4371805494025!2d-73.2644266!3d40.80680939999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e831cd6f588ce9%3A0xb2932a1078f343e2!2sRadisson%20Hotel%20Hauppauge-Long%20Island!5e0!3m2!1sen!2sng!4v1789645575447!5m2!1sen!2sng",
    mapsQuery: "Radisson Hotel Hauppauge-Long Island",
  },
  {
    name: "Funeral Viewing & Service (Dress code: All White)",
    date: { weekday: "Sat", day: "10", month: "Oct 2026", full: "Saturday, 10 October 2026" },
    times: ["Viewing 8:00 AM", "Service 10:00 AM"],
    venue: {
      name: "Chapey & Sons Funeral Home",
      lines: ["200 E Main Street", "East Islip, NY 11730"],
    },
    embed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2995.7738315395177!2d-73.18393328860225!3d40.7327586362256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e83475ee810e03%3A0x100b485ad88ed6dd!2sChapey%20%26%20Sons%20Funeral%20%26%20Cremation%20Care!5e0!3m2!1sen!2sng!4v1789645618682!5m2!1sen!2sng",
    mapsQuery: "Chapey & Sons Funeral Home, 200 E Main Street, East Islip, NY 11730",
  },
  {
    name: "Thanksgiving Service",
    date: { weekday: "Sun", day: "11", month: "Oct 2026", full: "Sunday, 11 October 2026" },
    times: [],
    note: "Venue and time will be shared soon.",
  },
];

const ngEvents: Event[] = [
  {
    name: "Burial",
    times: [],
    note: "Time will be updated soon. Please check back later.",
    venue: {
      name: "Ken Okonkwo’s Compound",
      lines: ["Mmakwum Village, Obosi", "Idemili North LGA, Anambra State"],
    },
    region: { title: "Obosi", subtitle: "Anambra State, Nigeria" },
    date: { weekday: "Fri", day: "11", month: "Dec 2026", full: "Friday, 11 December 2026" },
  },
];

export default function VenuesPage() {
  return (
    <div className="venues">
      <div className="page-head">
        <p className="eyebrow">Service &amp; Venues</p>
        <h1 className="page-title">Where we gather to remember him</h1>
      </div>

      <section className="country" aria-labelledby="country-us">
        <header className="country-head">
          <span className="label">United States</span>
          <h2 id="country-us">Three days on Long Island, New York</h2>
        </header>
        <ol className="events">
          {usEvents.map((e) => (
            <EventRow key={e.name} event={e} />
          ))}
        </ol>
      </section>

      <section className="country" aria-labelledby="country-ng">
        <header className="country-head">
          <span className="label">Nigeria</span>
          <h2 id="country-ng">Laid to rest at home in Obosi</h2>
        </header>
        <ol className="events">
          {ngEvents.map((e) => (
            <EventRow key={e.name} event={e} />
          ))}
        </ol>
      </section>

      <div className="info-grid">
        <section className="info">
          <span className="label">RSVP</span>
          <p>
            Kindly RSVP by 30 September 2026
            <br />
            <a href="tel:+14389780714">438-978-0714</a>{" "}
            <span className="rsvp-name">(Dili)</span>
            <br />
            <a href="tel:+16313556425">631-355-6425</a>{" "}
            <span className="rsvp-name">(Dr Ralu)</span>
          </p>
          <RsvpModal label="RSVP online" className="btn-gold rsvp-cta" />
        </section>
        <section className="info">
          <span className="label">Support</span>
          <p>
            Support is welcomed via
            <br />
            Zelle: 631-355-6425
            <br />
            Interac:{" "}
            <a href="mailto:okonkwodilichukwu@gmail.com">
              okonkwodilichukwu@gmail.com
            </a>
          </p>
        </section>
      </div>

      <section className="info info--wide">
        <span className="label">Travelling in</span>
        <p>
          Rooms can be booked at the Radisson Hotel, Hauppauge &mdash; the same
          venue as the Service of Songs.
        </p>
        <a
          href="https://www.booking.com/hotel/us/radisson-hotel-hauppauge-long-island.en-gb.html"
          target="_blank"
          rel="noreferrer"
          className="btn-outline"
        >
          Book a room
        </a>
      </section>
    </div>
  );
}

function EventRow({ event: e }: { event: Event }) {
  return (
    <li className="event">
      <div className={e.date ? "event-date" : "event-date event-date--tbc"}>
        {e.date ? (
          <>
            <span className="event-weekday">{e.date.weekday}</span>
            <span className="event-day">{e.date.day}</span>
            <span className="event-month">{e.date.month}</span>
          </>
        ) : (
          <>
            <span className="event-day">TBC</span>
            <span className="event-month">Date</span>
          </>
        )}
      </div>

      <div className="event-body">
        <h3>{e.name}</h3>
        {e.date && <p className="event-full-date">{e.date.full}</p>}

        {e.times.length > 0 && (
          <ul className="event-times">
            {e.times.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}

        {e.venue && (
          <address>
            <strong>{e.venue.name}</strong>
            {e.venue.lines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </address>
        )}

        {e.note && <p className="event-note">{e.note}</p>}

        {e.mapsQuery && (
          <a
            href={mapsLink(e.mapsQuery)}
            target="_blank"
            rel="noreferrer"
            className="btn-gold event-directions"
          >
            Get directions
          </a>
        )}
      </div>

      <div className={e.embed ? "event-map" : "event-map event-map--panel"}>
        {e.embed ? (
          <iframe
            src={e.embed}
            title={`Map: ${e.venue?.name ?? e.name}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <LocationPanel event={e} />
        )}
      </div>
    </li>
  );
}

/** Styled stand-in for events without a map embed */
function LocationPanel({ event: e }: { event: Event }) {
  return (
    <div className="location-panel">
      <span className="location-pin" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21 C12 21 18.5 15.4 18.5 10.5 A6.5 6.5 0 0 0 5.5 10.5 C5.5 15.4 12 21 12 21 Z" />
          <circle cx="12" cy="10.3" r="2.4" />
        </svg>
      </span>
      {e.region ? (
        <>
          <strong>{e.region.title}</strong>
          <span>{e.region.subtitle}</span>
        </>
      ) : (
        <>
          <strong>Venue to be announced</strong>
          <span>Details will appear here once confirmed.</span>
        </>
      )}
    </div>
  );
}
