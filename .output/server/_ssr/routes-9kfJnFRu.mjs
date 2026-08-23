import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as ImagePlus, i as Play, n as StickyNote, o as Clock3, r as Plus, t as Trash2 } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-9kfJnFRu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var DB_NAME = "nightstand-media";
var STORE = "media";
var DB_VERSION = 1;
function openDB() {
	return new Promise((resolve, reject) => {
		if (typeof indexedDB === "undefined") {
			reject(/* @__PURE__ */ new Error("IndexedDB is not available in this environment"));
			return;
		}
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
async function addMedia(item) {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(item);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
async function deleteMedia(id) {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).delete(id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
async function listMedia() {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
		req.onsuccess = () => {
			resolve(req.result.sort((a, b) => b.createdAt - a.createdAt));
		};
		req.onerror = () => reject(req.error);
	});
}
var NOTES_KEY = "nightstand.notes";
function makeId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") try {
		return crypto.randomUUID();
	} catch {}
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
function load(key) {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(key);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function useClock() {
	const [now, setNow] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setNow(/* @__PURE__ */ new Date());
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	return now;
}
function ClockPanel() {
	const now = useClock();
	const time = (0, import_react.useMemo)(() => {
		if (!now) return {
			h: "--",
			m: "--",
			s: "--",
			suffix: "",
			date: ""
		};
		const h24 = now.getHours();
		const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
		return {
			h: String(h12).padStart(2, "0"),
			m: String(now.getMinutes()).padStart(2, "0"),
			s: String(now.getSeconds()).padStart(2, "0"),
			suffix: h24 < 12 ? "AM" : "PM",
			date: now.toLocaleDateString(void 0, {
				weekday: "long",
				day: "numeric",
				month: "long"
			})
		};
	}, [now]);
	const greeting = (0, import_react.useMemo)(() => {
		const h = now?.getHours() ?? 9;
		if (h < 5) return "Late night";
		if (h < 12) return "Good morning";
		if (h < 18) return "Good afternoon";
		return "Good evening";
	}, [now]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass relative overflow-hidden rounded-3xl p-8 sm:p-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "label-caps flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, {
						className: "size-3.5",
						"aria-hidden": "true"
					}), greeting]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "label-caps",
					children: time.date
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 flex flex-wrap items-end gap-x-4 gap-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "clock-digits text-[22vw] sm:text-[15vw] lg:text-[10.5rem]",
					children: [
						time.h,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-primary",
							children: ":"
						}),
						time.m
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-col gap-1 sm:mb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "clock-digits text-3xl text-muted-foreground sm:text-4xl",
						children: time.s
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "label-caps text-primary",
						children: time.suffix
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-8 h-px w-full bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-md text-sm text-muted-foreground",
				children: "Your notes and photos live right here beside the time — saved privately on this device."
			})
		]
	});
}
function NotesPanel() {
	const [notes, setNotes] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => setNotes(load(NOTES_KEY)), []);
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined") window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
	}, [notes]);
	const add = () => {
		const text = draft.trim();
		if (!text) return;
		setNotes((prev) => [{
			id: makeId(),
			text,
			createdAt: Date.now()
		}, ...prev]);
		setDraft("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass flex flex-col rounded-3xl p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "label-caps flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, {
						className: "size-3.5",
						"aria-hidden": "true"
					}), "Notes"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: notes.length
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add();
					},
					placeholder: "Write something to remember…",
					rows: 3,
					className: "resize-none rounded-xl border-border bg-secondary/40 text-sm placeholder:text-muted-foreground"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: add,
					disabled: !draft.trim(),
					className: "self-start rounded-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-4",
						"aria-hidden": "true"
					}), "Add note"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-6 flex flex-col gap-3",
				children: [notes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
					children: "No notes yet."
				}), notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "group rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:border-primary/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm whitespace-pre-wrap text-foreground",
						children: note.text
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
							className: "label-caps text-[0.6rem]",
							children: new Date(note.createdAt).toLocaleString(void 0, {
								month: "short",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setNotes((p) => p.filter((n) => n.id !== note.id)),
							"aria-label": "Delete note",
							className: "text-muted-foreground opacity-70 transition-opacity hover:text-destructive hover:opacity-100",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
								className: "size-4",
								"aria-hidden": "true"
							})
						})]
					})]
				}, note.id))]
			})
		]
	});
}
function MediaPanel() {
	const [items, setItems] = (0, import_react.useState)([]);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		listMedia().then((stored) => {
			setItems(stored.map((m) => ({
				id: m.id,
				url: URL.createObjectURL(m.blob),
				name: m.name,
				kind: m.kind
			})));
		}).catch(() => setError("Couldn't load saved media on this device.")).finally(() => setLoaded(true));
	}, []);
	const onFiles = (0, import_react.useCallback)((files) => {
		if (!files) return;
		setError(null);
		Array.from(files).filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/")).forEach(async (file) => {
			const id = makeId();
			const kind = file.type.startsWith("video/") ? "video" : "image";
			try {
				await addMedia({
					id,
					name: file.name,
					kind,
					mimeType: file.type,
					blob: file,
					createdAt: Date.now()
				});
				setItems((prev) => [{
					id,
					url: URL.createObjectURL(file),
					name: file.name,
					kind
				}, ...prev]);
			} catch {
				setError("Couldn't save that file — your device may be out of storage.");
			}
		});
	}, []);
	const remove = (0, import_react.useCallback)((item) => {
		deleteMedia(item.id).catch(() => {});
		URL.revokeObjectURL(item.url);
		setItems((prev) => prev.filter((x) => x.id !== item.id));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass rounded-3xl p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "label-caps flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
						className: "size-3.5",
						"aria-hidden": "true"
					}), "Media wall"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "sm",
					className: "rounded-full",
					onClick: () => inputRef.current?.click(),
					children: "Add photos or videos"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				type: "file",
				accept: "image/*,video/*",
				multiple: true,
				className: "hidden",
				onChange: (e) => onFiles(e.target.files)
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				onDragOver: (e) => e.preventDefault(),
				onDrop: (e) => {
					e.preventDefault();
					onFiles(e.dataTransfer.files);
				},
				className: "mt-5",
				children: loaded && items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => inputRef.current?.click(),
					className: "w-full rounded-2xl border border-dashed border-border py-14 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
					children: "Drop photos or videos here or click to browse"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
					children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
						className: "group relative overflow-hidden rounded-2xl border border-border",
						children: [item.kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: item.url,
							muted: true,
							playsInline: true,
							loop: true,
							className: "aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105",
							onMouseEnter: (e) => e.currentTarget.play(),
							onMouseLeave: (e) => e.currentTarget.pause()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pointer-events-none absolute bottom-2 left-2 rounded-full bg-background/70 p-1.5 backdrop-blur",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
								className: "size-3 fill-current",
								"aria-hidden": "true"
							})
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: item.url,
							alt: item.name,
							loading: "lazy",
							className: "aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => remove(item),
							"aria-label": `Remove ${item.name}`,
							className: "absolute top-2 right-2 rounded-full bg-background/70 p-2 opacity-80 backdrop-blur transition-opacity hover:opacity-100 hover:text-destructive",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
								className: "size-3.5",
								"aria-hidden": "true"
							})
						})]
					}, item.id))
				})
			})
		]
	});
}
function Index() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-screen w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[1.35fr_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockPanel, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaPanel, {})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesPanel, {})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
			className: "label-caps mt-10 text-center",
			children: "Nightstand · stored locally"
		})]
	});
}
//#endregion
export { Index as component };
