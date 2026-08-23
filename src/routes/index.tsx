import { createFileRoute } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Trash2,
  ImagePlus,
  StickyNote,
  Clock3,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Bell,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  addMedia,
  deleteMedia,
  listMedia,
  updateMediaCaption,
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

type Note = {
  id: string;
  text: string;
  createdAt: number;
  reminderAt?: number | undefined;
  notifiedAt?: number | undefined;
};
type MediaItem = {
  id: string;
  url: string;
  name: string;
  kind: MediaKind;
  caption?: string | undefined;
};

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

function formatReminder(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (sameDay) return `Today, ${time}`;
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${time}`;
}

// Local <input type="datetime-local"> value (no timezone conversion surprises).
function toLocalInputValue(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [reminderEditId, setReminderEditId] = useState<string | null>(null);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");

  useEffect(() => setNotes(load<Note>(NOTES_KEY)), []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Checks for due reminders while the app is open (tab or installed PWA)
  // and fires a browser notification once per reminder.
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setNotes((prev) => {
        let changed = false;
        const next = prev.map((n) => {
          if (n.reminderAt && n.reminderAt <= now && !n.notifiedAt) {
            changed = true;
            if (typeof window !== "undefined" && "Notification" in window) {
              if (Notification.permission === "granted") {
                try {
                  new Notification("Nightstand reminder", {
                    body: n.text.slice(0, 140),
                    tag: n.id,
                  });
                } catch {
                  /* ignore — some browsers restrict Notification outside a service worker */
                }
              }
            }
            return { ...n, notifiedAt: now };
          }
          return n;
        });
        return changed ? next : prev;
      });
    }, 15_000);
    return () => window.clearInterval(id);
  }, []);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [
      { id: makeId(), text, createdAt: Date.now() },
      ...prev,
    ]);
    setDraft("");
  };

  const setReminder = async (noteId: string, value: string) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        const result = await Notification.requestPermission();
        setPermission(result);
      }
    }
    const ts = value ? new Date(value).getTime() : undefined;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, reminderAt: ts, notifiedAt: undefined } : n,
      ),
    );
    setReminderEditId(null);
  };

  const clearReminder = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, reminderAt: undefined, notifiedAt: undefined }
          : n,
      ),
    );
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

      {permission === "denied" && (
        <p className="mt-3 rounded-lg bg-secondary/40 p-2 text-xs text-muted-foreground">
          Notifications are blocked for this site, so reminders will only show
          while Nightstand is open. Allow notifications in your browser's site
          settings to get alerts in the background.
        </p>
      )}

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
        {notes.map((note) => {
          const isOverdue = !!note.reminderAt && note.reminderAt <= Date.now();
          const editingReminder = reminderEditId === note.id;
          return (
            <li
              key={note.id}
              className={`group rounded-xl border p-4 transition-colors ${
                isOverdue
                  ? "border-primary/60 bg-primary/10"
                  : "border-border bg-secondary/30 hover:border-primary/40"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {note.text}
              </p>

              {note.reminderAt && !editingReminder && (
                <button
                  onClick={() => setReminderEditId(note.id)}
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] ${
                    isOverdue
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <BellRing className="size-3" aria-hidden="true" />
                  {formatReminder(note.reminderAt)}
                </button>
              )}

              {editingReminder && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="datetime-local"
                    defaultValue={
                      note.reminderAt ? toLocalInputValue(note.reminderAt) : ""
                    }
                    onChange={(e) => setReminder(note.id, e.target.value)}
                    className="rounded-lg border border-border bg-secondary/40 px-2 py-1 text-xs text-foreground"
                    autoFocus
                  />
                  {note.reminderAt && (
                    <button
                      onClick={() => {
                        clearReminder(note.id);
                        setReminderEditId(null);
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  )}
                  <button
                    onClick={() => setReminderEditId(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <time className="label-caps text-[0.6rem]">
                  {new Date(note.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
                <div className="flex items-center gap-3">
                  {!note.reminderAt && (
                    <button
                      onClick={() => setReminderEditId(note.id)}
                      aria-label="Set reminder"
                      className="text-muted-foreground opacity-70 transition-opacity hover:text-primary hover:opacity-100"
                    >
                      <Bell className="size-4" aria-hidden="true" />
                    </button>
                  )}
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
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
  onCaptionChange,
}: {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
  onCaptionChange: (id: string, caption: string) => void;
}) {
  const item = items[index];
  const touchStartX = useRef<number | null>(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(item?.caption ?? "");

  useEffect(() => {
    setCaptionDraft(item?.caption ?? "");
    setEditingCaption(false);
    // Deliberately keyed on id only — this resets the draft when navigating
    // to a different item, not on every caption keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  // Lock page scroll while the fullscreen preview is open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
      if (e.key === "ArrowRight" && index < items.length - 1)
        onNavigate(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onNavigate]);

  if (!item) return null;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX;
    if (endX === undefined) return;
    const delta = endX - touchStartX.current;
    const SWIPE_THRESHOLD = 50;
    if (delta > SWIPE_THRESHOLD && index > 0) onNavigate(index - 1);
    else if (delta < -SWIPE_THRESHOLD && index < items.length - 1)
      onNavigate(index + 1);
    touchStartX.current = null;
  };

  // Rendered via a portal straight into <body>: an ancestor card uses
  // backdrop-filter (the "glass" look), and per the CSS spec that turns it
  // into the containing block for any `position: fixed` descendant — which
  // trapped this fullscreen preview inside the card instead of the viewport
  // (most visible on mobile, where it showed cut off near the bottom).
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="label-caps text-muted-foreground">
          {index + 1} / {items.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="rounded-full bg-secondary/60 p-2.5 text-foreground hover:text-primary"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-2 pb-2"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {index > 0 && (
          <button
            onClick={() => onNavigate(index - 1)}
            aria-label="Previous"
            className="absolute left-2 z-10 hidden rounded-full bg-secondary/60 p-2 text-foreground hover:text-primary sm:block"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
        )}

        {item.kind === "video" ? (
          <video
            src={item.url}
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full rounded-xl"
          />
        ) : (
          <img
            src={item.url}
            alt={item.caption || item.name}
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        )}

        {index < items.length - 1 && (
          <button
            onClick={() => onNavigate(index + 1)}
            aria-label="Next"
            className="absolute right-2 z-10 hidden rounded-full bg-secondary/60 p-2 text-foreground hover:text-primary sm:block"
          >
            <ChevronRight className="size-6" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="px-4 pb-5 sm:px-6">
        {editingCaption ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onCaptionChange(item.id, captionDraft.trim());
                  setEditingCaption(false);
                }
              }}
              placeholder="Add a caption…"
              className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground"
            />
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => {
                onCaptionChange(item.id, captionDraft.trim());
                setEditingCaption(false);
              }}
            >
              Save
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setEditingCaption(true)}
            className="flex w-full items-center gap-2 text-left text-sm text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3.5 shrink-0" aria-hidden="true" />
            {item.caption || "Add a caption…"}
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}

function MediaPanel() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
            caption: m.caption,
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

  const setCaption = useCallback((id: string, caption: string) => {
    updateMediaCaption(id, caption).catch(() => {
      /* caption still updates locally even if the DB write races */
    });
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, caption } : x)));
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
            {items.map((item, i) => (
              <figure
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-border"
              >
                <button
                  onClick={() => setOpenIndex(i)}
                  className="block w-full"
                  aria-label={`Open ${item.caption || item.name}`}
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
                      alt={item.caption || item.name}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </button>

                {item.caption && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-background/85 to-transparent px-2.5 pt-4 pb-1.5 text-[0.7rem] text-foreground">
                    {item.caption}
                  </span>
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

      {openIndex !== null && items[openIndex] && (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
          onCaptionChange={setCaption}
        />
      )}
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
