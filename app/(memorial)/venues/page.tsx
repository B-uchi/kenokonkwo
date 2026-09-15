import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service & Venues",
};

const directionsUrl =
  "https://maps.google.com/?q=Chapey+%26+Sons+Funeral+Home,+200+E+Main+Street,+East+Islip,+NY+11730";

export default function VenuesPage() {
  return (
    <div className="venues">
      <div className="page-head">
        <p className="eyebrow">Service &amp; Venues</p>
        <h1 className="page-title">Two services, two homes</h1>
      </div>

      <div className="venue-grid">
        <section className="venue">
          <span className="label">United States &middot; Funeral Service</span>
          <h2>Saturday, 10 October 2026</h2>
          <p className="venue-time">10:00 AM</p>
          <div className="venue-rule" />
          <address>
            Chapey &amp; Sons Funeral Home
            <br />
            200 E Main Street
            <br />
            East Islip, NY 11730, USA
          </address>
          <div className="map-preview">
            <span>map preview</span>
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-gold"
          >
            Get directions
          </a>
        </section>

        <section className="venue">
          <span className="label">Nigeria &middot; Burial &amp; Wake</span>
          <h2>Date to be confirmed</h2>
          <p className="venue-time">Time not available</p>
          <div className="venue-rule" />
          <address>
            Chapey &amp; Sons Funeral Home
            <br />
            200 E Main Street
            <br />
            East Islip, NY 11730, USA
          </address>
          <div className="map-preview">
            <span>map preview</span>
          </div>
          <span className="btn-disabled">Directions coming soon</span>
        </section>
      </div>

      <div className="info-grid">
        <section className="info">
          <span className="label">RSVP</span>
          <p>
            Kindly RSVP by 30 September 2026
            <br />
            <a href="tel:+16313556425">631-355-6425</a>
            <br />
            <a href="mailto:okonkwodilichukwu@gmail.com">
              okonkwodilichukwu@gmail.com
            </a>
          </p>
        </section>
        <section className="info">
          <span className="label">Sympathy gifts</span>
          <p>
            Sympathy gifts are welcome via
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
    </div>
  );
}
