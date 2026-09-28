import { Reveal } from "./Reveal";
import photo1 from "@/assets/couple-1.jpg";
import photo2 from "@/assets/couple-2.jpg";
import photo3 from "@/assets/couple-3.jpg";

const PHOTOS = [
  { src: photo2, alt: "Bharath and Bhavya sharing a tender moment", aspect: "aspect-[3/4]" },
  {
    src: photo3,
    alt: "Bharath and Bhavya hand in hand beside white pillars",
    aspect: "aspect-[2/3]",
  },
  {
    src: photo1,
    alt: "Bharath and Bhavya with their families at the wedding stage",
    aspect: "aspect-[3/2]",
  },
];

/** Photo gallery of the couple. */
export function Gallery() {
  return (
    <section id="gallery" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="eyebrow">Moments</p>
          <h2 className="mt-4 font-display text-5xl sm:text-6xl">
            <span className="text-gold">Us, So Far</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            A few of our favourite frames on the way to the mandap.
          </p>
          <div className="gold-rule mx-auto mt-8 w-40" />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTOS.map((p, i) => (
            <Reveal key={p.src} delay={i * 120} className="self-start">
              <figure className={`surface-card group overflow-hidden p-2 ${p.aspect}`}>
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="h-full w-full rounded-md object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                />
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
