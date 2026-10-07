// Tiny in-memory cache (single server process). Swap for Redis if you scale out.
const store = new Map();

module.exports = {
  get(key) {
    const hit = store.get(key);
    if (!hit) return null;
    if (hit.expires < Date.now()) {
      store.delete(key);
      return null;
    }
    return hit.value;
  },
  set(key, value, ttlMs) {
    store.set(key, { value, expires: Date.now() + ttlMs });
  },
};
