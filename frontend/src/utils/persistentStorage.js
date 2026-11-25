/**
 * Hybrid IndexedDB + Compact localStorage Persistence Layer
 *
 * Why this exists:
 * - Browsers cap localStorage at ~5 MB per origin. Uploading a 2-3 MB PDF resume plus
 *   project screenshots / certificate photos inside localStorage throws QuotaExceededError
 *   and silently drops subsequent admin changes (e.g., new social links, projects, theme toggles).
 * - IndexedDB supports 100+ MB durably across reloads, tabs, and browser restarts.
 * - We store the COMPLETE snapshot (all sections + Base64 binaries) in IndexedDB, AND store a
 *   compact JSON snapshot (< 40 KB, offloading large data URLs into IndexedDB asset slots) in
 *   localStorage so synchronous first-paint works instantaneously without ever overflowing quota.
 */

const DB_NAME = 'muthu_portfolio_idb';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

export const IDB_KEYS = {
  SNAPSHOT: 'portfolio_snapshot_v8',
  RESUME_DATA: 'resume_data_v1',
  RESUME_NAME: 'resume_filename_v1',
  DELETED_IDS: 'deleted_ids_v8',
};

const LARGE_DATA_THRESHOLD = 4096; // chars
const IDB_REF_PREFIX = 'idb://asset/';
const memoryAssets = new Map();

let dbPromise = null;

const openDb = () => {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch (_) {
      resolve(null);
    }
  });
  return dbPromise;
};

export const idbGet = async (key) => {
  if (memoryAssets.has(key)) return memoryAssets.get(key);
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result !== undefined && typeof req.result === 'string' && key.startsWith('asset_')) {
          memoryAssets.set(key, req.result);
        }
        resolve(req.result ?? null);
      };
      req.onerror = () => resolve(null);
    } catch (_) {
      resolve(null);
    }
  });
};

export const idbSet = async (key, value) => {
  if (typeof value === 'string' && key.startsWith('asset_')) {
    memoryAssets.set(key, value);
  }
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
};

export const idbDelete = async (key) => {
  memoryAssets.delete(key);
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
};

const isLargeDataUrl = (val) => typeof val === 'string' && val.startsWith('data:') && val.length > LARGE_DATA_THRESHOLD;

/**
 * Splits large inline Base64 data URLs out of portfolio state into IndexedDB asset entries
 * and returns a lightweight clone safe for localStorage.
 */
export const persistSnapshot = async (storageKey, fullData) => {
  if (!fullData || typeof fullData !== 'object') return;

  // 1. Always write the complete un-stripped state to IndexedDB (high capacity)
  await idbSet(IDB_KEYS.SNAPSHOT, fullData);

  // 2. Extract any large data: URLs before writing synchronous backup to localStorage
  const assetWrites = [];
  const compact = structuredCloneSafe(fullData);

  if (compact.profile) {
    if (typeof compact.profile.resumeUrl === 'string' && compact.profile.resumeUrl.startsWith('data:')) {
      assetWrites.push(idbSet(IDB_KEYS.RESUME_DATA, compact.profile.resumeUrl));
      compact.profile.resumeUrl = '/api/resume/';
    }
    if (isLargeDataUrl(compact.profile.button2Url)) {
      compact.profile.button2Url = '/api/resume/';
    }
    if (isLargeDataUrl(compact.profile.profileImage)) {
      const assetKey = 'asset_profile_img';
      assetWrites.push(idbSet(assetKey, compact.profile.profileImage));
      compact.profile.profileImage = `${IDB_REF_PREFIX}${assetKey}`;
    }
  }

  if (compact.about && isLargeDataUrl(compact.about.resumeUrl)) {
    compact.about.resumeUrl = '/api/resume/';
  }

  if (Array.isArray(compact.projects)) {
    compact.projects = compact.projects.map((p, idx) => {
      if (isLargeDataUrl(p?.image)) {
        const assetKey = `asset_proj_${p.id || idx}`;
        assetWrites.push(idbSet(assetKey, p.image));
        return { ...p, image: `${IDB_REF_PREFIX}${assetKey}` };
      }
      return p;
    });
  }

  if (Array.isArray(compact.certifications)) {
    compact.certifications = compact.certifications.map((c, idx) => {
      if (isLargeDataUrl(c?.certificateImg)) {
        const assetKey = `asset_cert_${c.id || idx}`;
        assetWrites.push(idbSet(assetKey, c.certificateImg));
        return { ...c, certificateImg: `${IDB_REF_PREFIX}${assetKey}` };
      }
      return c;
    });
  }

  if (assetWrites.length > 0) {
    await Promise.all(assetWrites);
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(compact));
  } catch (err) {
    console.warn('localStorage compact write warning:', err);
  }
};

/**
 * Strips unresolved idb:// markers from synchronous localStorage snapshot so
 * <img> never tries to request an invalid idb:// scheme before IndexedDB resolves (~3ms).
 */
export const sanitizeCompactForInitialRender = (rawObj) => {
  if (!rawObj || typeof rawObj !== 'object') return rawObj;
  const copy = structuredCloneSafe(rawObj);

  const resolveSync = (val) => {
    if (typeof val !== 'string' || !val.startsWith(IDB_REF_PREFIX)) return val;
    const key = val.slice(IDB_REF_PREFIX.length);
    return memoryAssets.get(key) || '';
  };

  if (copy.profile?.profileImage) {
    copy.profile.profileImage = resolveSync(copy.profile.profileImage);
  }
  if (Array.isArray(copy.projects)) {
    copy.projects = copy.projects.map((p) => (p?.image?.startsWith?.(IDB_REF_PREFIX) ? { ...p, image: resolveSync(p.image) } : p));
  }
  if (Array.isArray(copy.certifications)) {
    copy.certifications = copy.certifications.map((c) =>
      c?.certificateImg?.startsWith?.(IDB_REF_PREFIX) ? { ...c, certificateImg: resolveSync(c.certificateImg) } : c
    );
  }
  return copy;
};

/**
 * Re-hydrates full snapshot + any idb:// references from IndexedDB.
 */
export const loadFullSnapshot = async () => {
  const snap = await idbGet(IDB_KEYS.SNAPSHOT);
  if (!snap || typeof snap !== 'object') return null;

  const resolveAsync = async (val) => {
    if (typeof val !== 'string' || !val.startsWith(IDB_REF_PREFIX)) return val;
    const key = val.slice(IDB_REF_PREFIX.length);
    const loaded = await idbGet(key);
    return loaded || '';
  };

  if (snap.profile?.profileImage) {
    snap.profile.profileImage = await resolveAsync(snap.profile.profileImage);
  }
  if (Array.isArray(snap.projects)) {
    snap.projects = await Promise.all(
      snap.projects.map(async (p) =>
        p?.image?.startsWith?.(IDB_REF_PREFIX) ? { ...p, image: await resolveAsync(p.image) } : p
      )
    );
  }
  if (Array.isArray(snap.certifications)) {
    snap.certifications = await Promise.all(
      snap.certifications.map(async (c) =>
        c?.certificateImg?.startsWith?.(IDB_REF_PREFIX)
          ? { ...c, certificateImg: await resolveAsync(c.certificateImg) }
          : c
      )
    );
  }

  return snap;
};

const structuredCloneSafe = (obj) => {
  try {
    if (typeof structuredClone === 'function') return structuredClone(obj);
  } catch (_) {}
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (_) {
    return { ...obj };
  }
};
