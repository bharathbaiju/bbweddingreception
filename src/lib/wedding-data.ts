export type WeddingEvent = {
  id: string;
  name: string;
  tagline: string;
  dateLabel: string;
  dayLabel: string;
  timeLabel: string;
  venue: string;
  address: string;
  mapsQuery: string;
  /** ISO local start / end, IST (+05:30) */
  start: string;
  end: string;
};

export const COUPLE = {
  groom: "Bharath",
  bride: "Bhavya",
  groomParents: "Baiju M.B & Swapna Baiju",
  groomHome: "Muthedath House, P.O. Peringottukara, Trissur",
  brideParents: "Vijil & Sindu Vijil",
  brideHome: "Parakkal House, Yakkara, Palakkad",
  phone: "+91 8129850399",
  email: "baijumb@gmail.com",
  quote: "Two hearts, one promise, a lifetime together.",
};

export const EVENTS: WeddingEvent[] = [
  {
    id: "wedding",
    name: "The Wedding",
    tagline: "The auspicious muhurtham of Bharath & Bhavya",
    dateLabel: "24 October 2026",
    dayLabel: "Saturday",
    timeLabel: "10.30 AM – 11.30 AM",
    venue: "Kalarikkal Convention Centre",
    address: "Kuzhalmannam, Palakkad",
    mapsQuery: "Kalarikkal Convention Centre, Kuzhalmannam, Palakkad, Kerala",
    start: "2026-10-24T10:30:00+05:30",
    end: "2026-10-24T11:30:00+05:30",
  },
  {
    id: "reception",
    name: "The Reception",
    tagline: "Dinner, laughter and blessings for the newlyweds",
    dateLabel: "25 October 2026",
    dayLabel: "Sunday",
    timeLabel: "6.30 PM – 9.30 PM",
    venue: "Majestic Ceremonials Convention Centre",
    address: "Koprakalam Juma Masjid Road, Triprayar",
    mapsQuery:
      "Majestic Ceremonials Convention Centre, Koprakalam Juma Masjid Road, Triprayar, Kerala",
    start: "2026-10-25T18:30:00+05:30",
    end: "2026-10-25T21:30:00+05:30",
  },
];

export const WEDDING_DATE = new Date(EVENTS[0]!.start);

const toUtcStamp = (iso: string) =>
  new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

export const mapsUrl = (event: WeddingEvent) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapsQuery)}`;

export const googleCalendarUrl = (event: WeddingEvent) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.name} — ${COUPLE.groom} & ${COUPLE.bride}`,
    dates: `${toUtcStamp(event.start)}/${toUtcStamp(event.end)}`,
    details: `${event.tagline}\n\n${COUPLE.quote}`,
    location: `${event.venue}, ${event.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const icsContent = (event: WeddingEvent) =>
  [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bharath and Bhavya//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}-bharath-bhavya@wedding`,
    `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
    `DTSTART:${toUtcStamp(event.start)}`,
    `DTEND:${toUtcStamp(event.end)}`,
    `SUMMARY:${event.name} — ${COUPLE.groom} & ${COUPLE.bride}`,
    `DESCRIPTION:${event.tagline}`,
    `LOCATION:${event.venue}\\, ${event.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
