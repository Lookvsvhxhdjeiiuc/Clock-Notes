import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  ImagePlus,
  StickyNote,
  Clock3,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  addMedia,
  deleteMedia,
  listMedia,
  type MediaKind,
} from "@/lib/media-db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nightstand — Modern Clock, Notes & Photos" },
      {
        name: "description",
        content:
          "A calm, modern clock dashboard with quick notes and a personal photo wall. Everything stays on your device.",
      },
      {
        property: "og:title",
        content: "Nightstand — Modern Clock, Notes & Photos",
      },
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
type MediaItem = { id: string; url: string; name: string; kind: MediaKind };

const NOTES_KEY = "nightstand.notes";

// crypto.randomUUID() only works in a "secure context" (https or localhost).
// This falls back to a manual generator so it also works over plain http
// (e.g. opening the dev server from another device via a LAN IP).
function makeId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
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
        Your notes and photos live right here beside the time — saved privately
        on this device.
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
        <Button
          onClick={add}
          disabled={!draft.trim()}
          className="self-start rounded-full"
        >
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
            <p className="text-sm whitespace-pre-wrap text-foreground">
              {note.text}
            </p>
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
                onClick={() =>
                  setNotes((p) => p.filter((n) => n.id !== note.id))
                }
                aria-label="Delete note"
                className="text-muted-foreground opacity-70 transition-opacity hover:text-destructive hover:opacity-100"
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

function MediaPanel() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listMedia()
      .then((stored) => {
        setItems(
          stored.map((m) => ({
            id: m.id,
            url: URL.createObjectURL(m.blob),
            name: m.name,
            kind: m.kind,
          })),
        );
      })
      .catch(() => setError("Couldn't load saved media on this device."))
      .finally(() => setLoaded(true));
    // Object URLs are released on full page unload; nothing to clean up
    // per-render since the list only changes via add/remove below.
  }, []);

  const onFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setError(null);
    Array.from(files)
      .filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"))
      .forEach(async (file) => {
        const id = makeId();
        const kind: MediaKind = file.type.startsWith("video/")
          ? "video"
          : "image";
        try {
          await addMedia({
            id,
            name: file.name,
            kind,
            mimeType: file.type,
            blob: file,
            createdAt: Date.now(),
          });
          setItems((prev) => [
            { id, url: URL.createObjectURL(file), name: file.name, kind },
            ...prev,
          ]);
        } catch {
          setError(
            "Couldn't save that file — your device may be out of storage.",
          );
        }
      });
  }, []);

  const remove = useCallback((item: MediaItem) => {
    deleteMedia(item.id).catch(() => {
      /* local list is still updated below even if the DB delete races */
    });
    URL.revokeObjectURL(item.url);
    setItems((prev) => prev.filter((x) => x.id !== item.id));
  }, []);

  return (
    <section className="glass rounded-3xl p-6">
      <header className="flex items-center justify-between">
        <span className="label-caps flex items-center gap-2">
          <ImagePlus className="size-3.5" aria-hidden="true" />
          Media wall
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full"
          onClick={() => inputRef.current?.click()}
        >
          Add photos or videos
        </Button>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
        className="mt-5"
      >
        {loaded && items.length === 0 ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-2xl border border-dashed border-border py-14 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            Drop photos or videos here or click to browse
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <figure
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-border"
              >
                {item.kind === "video" ? (
                  <>
                    <video
                      src={item.url}
                      muted
                      playsInline
                      loop
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                    <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-background/70 p-1.5 backdrop-blur">
                      <Play
                        className="size-3 fill-current"
                        aria-hidden="true"
                      />
                    </span>
                  </>
                ) : (
                  <img
                    src={item.url}
                    alt={item.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {/* Always visible (not hover-only) so it's reachable on touch devices. */}
                <button
                  onClick={() => remove(item)}
                  aria-label={`Remove ${item.name}`}
                  className="absolute top-2 right-2 rounded-full bg-background/70 p-2 opacity-80 backdrop-blur transition-opacity hover:opacity-100 hover:text-destructive"
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
          <MediaPanel />
        </div>
        <NotesPanel />
      </div>
      <footer className="label-caps mt-10 text-center">
        Nightstand · stored locally
      </footer>
    </main>
  );
}
