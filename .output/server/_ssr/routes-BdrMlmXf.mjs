import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as Play, c as Clock3, d as Bell, f as BellRing, i as Plus, l as ChevronRight, n as Trash2, o as Pencil, r as StickyNote, s as ImagePlus, t as X, u as ChevronLeft } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BdrMlmXf.js
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
async function updateMediaCaption(id, caption) {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		const store = tx.objectStore(STORE);
		const getReq = store.get(id);
		getReq.onsuccess = () => {
			const record = getReq.result;
			if (record) {
				record.caption = caption;
				store.put(record);
			}
		};
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
function formatReminder(ts) {
	const d = new Date(ts);
	const today = /* @__PURE__ */ new Date();
	const sameDay = d.toDateString() === today.toDateString();
	const time = d.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	});
	if (sameDay) return `Today, ${time}`;
	return `${d.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	})}, ${time}`;
}
function toLocalInputValue(ts) {
	const d = new Date(ts);
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function NotesPanel() {
	const [notes, setNotes] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [reminderEditId, setReminderEditId] = (0, import_react.useState)(null);
	const [permission, setPermission] = (0, import_react.useState)("unsupported");
	(0, import_react.useEffect)(() => setNotes(load(NOTES_KEY)), []);
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined") window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
	}, [notes]);
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined" && "Notification" in window) setPermission(Notification.permission);
	}, []);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			const now = Date.now();
			setNotes((prev) => {
				let changed = false;
				const next = prev.map((n) => {
					if (n.reminderAt && n.reminderAt <= now && !n.notifiedAt) {
						changed = true;
						if (typeof window !== "undefined" && "Notification" in window) {
							if (Notification.permission === "granted") try {
								new Notification("Nightstand reminder", {
									body: n.text.slice(0, 140),
									tag: n.id
								});
							} catch {}
						}
						return {
							...n,
							notifiedAt: now
						};
					}
					return n;
				});
				return changed ? next : prev;
			});
		}, 15e3);
		return () => window.clearInterval(id);
	}, []);
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
	const setReminder = async (noteId, value) => {
		if (typeof window !== "undefined" && "Notification" in window) {
			if (Notification.permission === "default") {
				const result = await Notification.requestPermission();
				setPermission(result);
			}
		}
		const ts = value ? new Date(value).getTime() : void 0;
		setNotes((prev) => prev.map((n) => n.id === noteId ? {
			...n,
			reminderAt: ts,
			notifiedAt: void 0
		} : n));
		setReminderEditId(null);
	};
	const clearReminder = (noteId) => {
		setNotes((prev) => prev.map((n) => n.id === noteId ? {
			...n,
			reminderAt: void 0,
			notifiedAt: void 0
		} : n));
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
			permission === "denied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 rounded-lg bg-secondary/40 p-2 text-xs text-muted-foreground",
				children: "Notifications are blocked for this site, so reminders will only show while Nightstand is open. Allow notifications in your browser's site settings to get alerts in the background."
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
				}), notes.map((note) => {
					const isOverdue = !!note.reminderAt && note.reminderAt <= Date.now();
					const editingReminder = reminderEditId === note.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: `group rounded-xl border p-4 transition-colors ${isOverdue ? "border-primary/60 bg-primary/10" : "border-border bg-secondary/30 hover:border-primary/40"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm whitespace-pre-wrap text-foreground",
								children: note.text
							}),
							note.reminderAt && !editingReminder && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setReminderEditId(note.id),
								className: `mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] ${isOverdue ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, {
									className: "size-3",
									"aria-hidden": "true"
								}), formatReminder(note.reminderAt)]
							}),
							editingReminder && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "datetime-local",
										defaultValue: note.reminderAt ? toLocalInputValue(note.reminderAt) : "",
										onChange: (e) => setReminder(note.id, e.target.value),
										className: "rounded-lg border border-border bg-secondary/40 px-2 py-1 text-xs text-foreground",
										autoFocus: true
									}),
									note.reminderAt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											clearReminder(note.id);
											setReminderEditId(null);
										},
										className: "text-xs text-muted-foreground hover:text-destructive",
										children: "Remove"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setReminderEditId(null),
										className: "text-xs text-muted-foreground hover:text-foreground",
										children: "Close"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
									className: "label-caps text-[0.6rem]",
									children: new Date(note.createdAt).toLocaleString(void 0, {
										month: "short",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [!note.reminderAt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setReminderEditId(note.id),
										"aria-label": "Set reminder",
										className: "text-muted-foreground opacity-70 transition-opacity hover:text-primary hover:opacity-100",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
											className: "size-4",
											"aria-hidden": "true"
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
							})
						]
					}, note.id);
				})]
			})
		]
	});
}
function Lightbox({ items, index, onClose, onNavigate, onCaptionChange }) {
	const item = items[index];
	const touchStartX = (0, import_react.useRef)(null);
	const [editingCaption, setEditingCaption] = (0, import_react.useState)(false);
	const [captionDraft, setCaptionDraft] = (0, import_react.useState)(item?.caption ?? "");
	(0, import_react.useEffect)(() => {
		setCaptionDraft(item?.caption ?? "");
		setEditingCaption(false);
	}, [item?.id]);
	(0, import_react.useEffect)(() => {
		const original = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = original;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
			if (e.key === "ArrowRight" && index < items.length - 1) onNavigate(index + 1);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		index,
		items.length,
		onClose,
		onNavigate
	]);
	if (!item) return null;
	const handleTouchStart = (e) => {
		touchStartX.current = e.touches[0]?.clientX ?? null;
	};
	const handleTouchEnd = (e) => {
		if (touchStartX.current === null) return;
		const endX = e.changedTouches[0]?.clientX;
		if (endX === void 0) return;
		const delta = endX - touchStartX.current;
		if (delta > 50 && index > 0) onNavigate(index - 1);
		else if (delta < -50 && index < items.length - 1) onNavigate(index + 1);
		touchStartX.current = null;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl",
		style: {
			paddingTop: "env(safe-area-inset-top)",
			paddingBottom: "env(safe-area-inset-bottom)"
		},
		onTouchStart: handleTouchStart,
		onTouchEnd: handleTouchEnd,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-3 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "label-caps text-muted-foreground",
					children: [
						index + 1,
						" / ",
						items.length
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					"aria-label": "Close preview",
					className: "rounded-full bg-secondary/60 p-2.5 text-foreground hover:text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-5",
						"aria-hidden": "true"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex flex-1 items-center justify-center px-2 pb-2",
				onClick: (e) => {
					if (e.target === e.currentTarget) onClose();
				},
				children: [
					index > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onNavigate(index - 1),
						"aria-label": "Previous",
						className: "absolute left-2 z-10 hidden rounded-full bg-secondary/60 p-2 text-foreground hover:text-primary sm:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
							className: "size-6",
							"aria-hidden": "true"
						})
					}),
					item.kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						src: item.url,
						controls: true,
						autoPlay: true,
						playsInline: true,
						className: "max-h-full max-w-full rounded-xl"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: item.url,
						alt: item.caption || item.name,
						className: "max-h-full max-w-full rounded-xl object-contain"
					}),
					index < items.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onNavigate(index + 1),
						"aria-label": "Next",
						className: "absolute right-2 z-10 hidden rounded-full bg-secondary/60 p-2 text-foreground hover:text-primary sm:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							className: "size-6",
							"aria-hidden": "true"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 pb-5 sm:px-6",
				children: editingCaption ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoFocus: true,
						value: captionDraft,
						onChange: (e) => setCaptionDraft(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter") {
								onCaptionChange(item.id, captionDraft.trim());
								setEditingCaption(false);
							}
						},
						placeholder: "Add a caption…",
						className: "w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						className: "rounded-full",
						onClick: () => {
							onCaptionChange(item.id, captionDraft.trim());
							setEditingCaption(false);
						},
						children: "Save"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setEditingCaption(true),
					className: "flex w-full items-center gap-2 text-left text-sm text-muted-foreground hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
						className: "size-3.5 shrink-0",
						"aria-hidden": "true"
					}), item.caption || "Add a caption…"]
				})
			})
		]
	});
}
function MediaPanel() {
	const [items, setItems] = (0, import_react.useState)([]);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [openIndex, setOpenIndex] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		listMedia().then((stored) => {
			setItems(stored.map((m) => ({
				id: m.id,
				url: URL.createObjectURL(m.blob),
				name: m.name,
				kind: m.kind,
				caption: m.caption
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
	const setCaption = (0, import_react.useCallback)((id, caption) => {
		updateMediaCaption(id, caption).catch(() => {});
		setItems((prev) => prev.map((x) => x.id === id ? {
			...x,
			caption
		} : x));
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
					children: items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
						className: "group relative overflow-hidden rounded-2xl border border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setOpenIndex(i),
								className: "block w-full",
								"aria-label": `Open ${item.caption || item.name}`,
								children: item.kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
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
									alt: item.caption || item.name,
									loading: "lazy",
									className: "aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
								})
							}),
							item.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-background/85 to-transparent px-2.5 pt-4 pb-1.5 text-[0.7rem] text-foreground",
								children: item.caption
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => remove(item),
								"aria-label": `Remove ${item.name}`,
								className: "absolute top-2 right-2 rounded-full bg-background/70 p-2 opacity-80 backdrop-blur transition-opacity hover:opacity-100 hover:text-destructive",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
									className: "size-3.5",
									"aria-hidden": "true"
								})
							})
						]
					}, item.id))
				})
			}),
			openIndex !== null && items[openIndex] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbox, {
				items,
				index: openIndex,
				onClose: () => setOpenIndex(null),
				onNavigate: setOpenIndex,
				onCaptionChange: setCaption
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
