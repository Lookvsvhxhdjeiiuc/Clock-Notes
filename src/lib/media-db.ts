// Photos and videos are stored as Blobs in IndexedDB instead of base64 strings
// in localStorage. localStorage has a ~5-10MB total quota shared across the
// whole app, which a single video clip can blow through instantly. IndexedDB
// comfortably handles hundreds of MBs of binary data.

export type MediaKind = "image" | "video";

export type StoredMedia = {
  id: string;
  name: string;
  kind: MediaKind;
  mimeType: string;
  blob: Blob;
  caption?: string | undefined;
  createdAt: number;
};

const DB_NAME = "nightstand-media";
const STORE = "media";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addMedia(item: StoredMedia): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteMedia(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateMediaCaption(
  id: string,
  caption: string,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const record = getReq.result as StoredMedia | undefined;
      if (record) {
        record.caption = caption;
        store.put(record);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listMedia(): Promise<StoredMedia[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const items = (req.result as StoredMedia[]).sort(
        (a, b) => b.createdAt - a.createdAt,
      );
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}
