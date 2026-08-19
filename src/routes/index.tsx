import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, ImagePlus, StickyNote, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nightstand — Modern Clock, Notes & Photos" },
      {
        name: "description",
        content:
          "A calm, modern clock dashboard with quick notes and a personal photo wall. Everything stays on your device.",
      },
      { property: "og:title", content: "Nightstand — Modern Clock, Notes & Photos" },
      {
        property: "og:description",
        content:
          "A calm, modern clock dashboard with quick notes and a personal photo wall.",
      },
    ],
  }),
  component: Index,
});

type Note = { id: string; text: string; createdAt: number };
type Photo = { id: string; src: string; name: string };

const NOTES_KEY = "nightstand.notes";
const PHOTOS_KEY = "nightstand.photos";

// crypto.randomUUID() only works in a "secure context" (https or localhost).
// This falls back to a manual generator so it also works over plain http
// (e.g. opening the dev server from another device via a LAN IP).
function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // fall through to manual generator
    }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function ClockPanel() {
  const now = useClock();
  const time = useMemo(() => {
    if (!now) return { h: "--", m: "--", s: "--", suffix: "", date: "" };
    const h24 = now.getHours();
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      h: String(h12).padStart(2, "0"),
      m: String(now.getMinutes()).padStart(2, "0"),
      s: String(now.getSeconds()).padStart(2, "0"),
      suffix: h24 < 12 ? "AM" : "PM",
      date: now.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    };
  }, [now]);

  const greeting = useMemo(() => {
    const h = now?.getHours() ?? 9;
    if (h < 5) return "Late night";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, [now]);

  return (
    <section className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
      <div className="flex items-center justify-between gap-4">
        <span className="label-caps flex items-center gap-2">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {greeting}
        </span>
        <span className="label-caps">{time.date}</span>
      </div>

      <div className="mt-10 flex flex-wrap items-end gap-x-4 gap-y-2">
        <h1 className="clock-digits text-[22vw] sm:text-[15vw] lg:text-[10.5rem]">
          {time.h}
          <span className="text-primary">:</span>
          {time.m}
        </h1>
        <div className="mb-3 flex flex-col gap-1 sm:mb-5">
          <span className="clock-digits text-3xl text-muted-foreground sm:text-4xl">
            {time.s}
          </span>
          <span className="label-caps text-primary">{time.suffix}</span>
        </div>
      </div>

      <div className="mt-8 h-px w-full bg-border" />
      <p className="mt-4 max-w-md text-sm text-muted-foreground">
        Your notes and photos live right here beside the time — saved privately on this
        device.
      </p>
    </section>
  );
}

function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => setNotes(load<Note>(NOTES_KEY)), []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [
      { id: makeId(), text, createdAt: Date.now() },
      ...prev,
    ]);
    setDraft("");
  };

  return (
    <section className="glass flex flex-col rounded-3xl p-6">
      <header className="flex items-center justify-between">
        <span className="label-caps flex items-center gap-2">
          <StickyNote className="size-3.5" aria-hidden="true" />
          Notes
        </span>
        <span className="text-xs text-muted-foreground">{notes.length}</span>
      </header>

      <div className="mt-4 flex flex-col gap-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add();
          }}
          placeholder="Write something to remember…"
          rows={3}
          className="resize-none rounded-xl border-border bg-secondary/40 text-sm placeholder:text-muted-foreground"
        />
        <Button onClick={add} disabled={!draft.trim()} className="self-start rounded-full">
          <Plus className="size-4" aria-hidden="true" />
          Add note
        </Button>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {notes.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No notes yet.
          </li>
        )}
        {notes.map((note) => (
          <li
            key={note.id}
            className="group rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:border-primary/40"
          >
            <p className="text-sm whitespace-pre-wrap text-foreground">{note.text}</p>
            <div className="mt-3 flex items-center justify-between">
              <time className="label-caps text-[0.6rem]">
                {new Date(note.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
              <button
                onClick={() => setNotes((p) => p.filter((n) => n.id !== note.id))}
                aria-label="Delete note"
                className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PhotosPanel() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setPhotos(load<Photo>(PHOTOS_KEY)), []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
    }
  }, [photos]);

  const onFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () =>
          setPhotos((prev) => [
            { id: makeId(), src: String(reader.result), name: file.name },
            ...prev,
          ]);
        reader.readAsDataURL(file);
      });
  }, []);

  return (
    <section className="glass rounded-3xl p-6">
      <header className="flex items-center justify-between">
        <span className="label-caps flex items-center gap-2">
          <ImagePlus className="size-3.5" aria-hidden="true" />
          Photo wall
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full"
          onClick={() => inputRef.current?.click()}
        >
          Add photos
        </Button>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
        className="mt-5"
      >
        {photos.length === 0 ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-2xl border border-dashed border-border py-14 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            Drop images here or click to browse
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <figure
                key={photo.id}
                className="group relative overflow-hidden rounded-2xl border border-border"
              >
                <img
                  src={photo.src}
                  alt={photo.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  onClick={() => setPhotos((p) => p.filter((x) => x.id !== photo.id))}
                  aria-label={`Remove ${photo.name}`}
                  className="absolute top-2 right-2 rounded-full bg-background/70 p-2 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Index() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col gap-6">
          <ClockPanel />
          <PhotosPanel />
        </div>
        <NotesPanel />
      </div>
      <footer className="label-caps mt-10 text-center">
        Nightstand · stored locally
      </footer>
    </main>
  );
}
