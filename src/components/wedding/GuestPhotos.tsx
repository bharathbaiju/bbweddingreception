import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/integrations/supabase/client";
import { submitGuestPhoto } from "@/lib/guest-submissions.functions";
import { isMeaningfulText, cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { ConfettiBurst } from "./ConfettiBurst";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

type GuestPhoto = {
  id: string;
  name: string;
  storage_path: string;
  created_at: string;
};

const BUCKET = "guest-photos";
const MAX_FILES_PER_BATCH = 6;

const photosQuery = {
  queryKey: ["guest-photos"],
  queryFn: async (): Promise<GuestPhoto[]> => {
    const { data, error } = await supabase
      .from("guest_photos")
      .select("id,name,storage_path,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return data ?? [];
  },
};

const photoUrl = (path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

/** Downscales/re-encodes a photo before upload; falls back to the original file if that fails. */
async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

export function GuestPhotos() {
  const qc = useQueryClient();
  const { data: photos = [], isLoading } = useQuery(photosQuery);
  const [name, setName] = useState("");
  const [burst, setBurst] = useState(0);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendPhoto = useServerFn(submitGuestPhoto);
  const autoplay = useRef(
    Autoplay({ delay: 3000, stopOnMouseEnter: true, stopOnInteraction: false }),
  );
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setCurrent(api.selectedScrollSnap());
      setSlideCount(api.scrollSnapList().length);
    };
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  const uploadOne = async (file: File, uploaderName: string) => {
    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const compressed = await compressImage(file);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, compressed, { contentType: "image/jpeg", upsert: false });
    if (uploadError) throw uploadError;
    await sendPhoto({ data: { name: uploaderName, storagePath: path } });
  };

  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      let done = 0;
      setProgress({ done, total: files.length });
      for (const file of files) {
        await uploadOne(file, name.trim());
        done += 1;
        setProgress({ done, total: files.length });
      }
    },
    onSuccess: () => {
      toast.success("Thank you — your photos are up on the wall.");
      setBurst((n) => n + 1);
      void qc.invalidateQueries({ queryKey: ["guest-photos"] });
    },
    onError: () => toast.error("Some photos didn't upload. Please try again."),
    onSettled: () => setProgress(null),
  });

  const pickFiles = () => fileInputRef.current?.click();

  const onFilesChosen = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    if (!isMeaningfulText(name, 2)) {
      toast.error("Please tell us your name first.");
      return;
    }
    const files = Array.from(fileList).slice(0, MAX_FILES_PER_BATCH);
    mutation.mutate(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section id="photos" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal className="relative text-center">
          <ConfettiBurst trigger={burst} icon="sparkle" count={22} />
          <p className="eyebrow">Captured by you</p>
          <h2 className="mt-4 font-display text-5xl sm:text-6xl">
            <span className="text-gold">Share Your Photos</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Got a photo from the celebrations? Add it here so everyone can relive the day together.
          </p>
          <div className="gold-rule mx-auto mt-8 w-40" />
        </Reveal>

        <Reveal delay={120}>
          <div className="surface-card mx-auto mt-12 max-w-2xl p-6 text-center sm:p-9">
            <label className="block text-left">
              <span className="eyebrow">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={80}
                className="mt-2 w-full rounded-md border border-input bg-card/70 px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onFilesChosen(e.target.files)}
            />

            <button
              type="button"
              onClick={pickFiles}
              disabled={mutation.isPending}
              className="btn-gold mt-6 w-full"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {progress ? `Uploading ${progress.done + 1} of ${progress.total}…` : "Uploading…"}
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" /> Add your photos
                </>
              )}
            </button>
            <p className="mt-3 text-[0.68rem] tracking-[0.1em] text-muted-foreground uppercase">
              Up to {MAX_FILES_PER_BATCH} photos at a time
            </p>
          </div>
        </Reveal>

        <Reveal delay={180} className="mt-14">
          {isLoading && (
            <p className="text-center text-sm text-muted-foreground">Gathering photos…</p>
          )}
          {!isLoading && photos.length === 0 && (
            <p className="text-center text-sm italic text-muted-foreground">
              <Camera className="mx-auto mb-2 h-5 w-5 text-gold" />
              No photos yet — be the first to share one.
            </p>
          )}
          {!isLoading && photos.length > 0 && (
            <Carousel
              setApi={setApi}
              opts={{ loop: true, align: "center" }}
              plugins={[autoplay.current]}
              className="mx-auto px-10 sm:px-14"
            >
              <CarouselContent>
                {photos.map((p) => (
                  <CarouselItem key={p.id} className="basis-1/2 sm:basis-1/3 lg:basis-1/4">
                    <figure className="surface-card group aspect-square overflow-hidden p-1.5">
                      <img
                        src={photoUrl(p.storage_path)}
                        alt={`Shared by ${p.name}`}
                        loading="lazy"
                        className="h-full w-full rounded-md object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </figure>
                    <figcaption className="mt-2 truncate text-center text-[0.65rem] tracking-[0.14em] text-gold-deep uppercase">
                      {p.name}
                    </figcaption>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="border-input bg-card/85 text-gold-deep hover:bg-card" />
              <CarouselNext className="border-input bg-card/85 text-gold-deep hover:bg-card" />
            </Carousel>
          )}
          {!isLoading && slideCount > 1 && slideCount <= 16 && (
            <div className="mt-6 flex justify-center gap-1.5">
              {Array.from({ length: slideCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to photo ${i + 1}`}
                  onClick={() => api?.scrollTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === current ? "w-5 bg-[image:var(--gradient-gold)]" : "w-1.5 bg-border",
                  )}
                />
              ))}
            </div>
          )}
          {!isLoading && slideCount > 16 && (
            <p className="mt-6 text-center text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">
              {current + 1} / {slideCount}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
