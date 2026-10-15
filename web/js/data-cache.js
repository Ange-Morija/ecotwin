/** In-memory snapshots only: no credentials or private data are persisted. */
export function createSnapshotLoader(
  loader,
  { ttl = 30_000, now = Date.now } = {},
) {
  let value;
  let updatedAt = -Infinity;
  let pending;
  let revision = 0;

  function load() {
    if (value !== undefined && now() - updatedAt < ttl)
      return Promise.resolve(value);
    if (pending) return pending;
    const generation = revision;
    const request = Promise.resolve()
      .then(loader)
      .then((result) => {
        if (generation === revision) {
          value = result;
          updatedAt = now();
        }
        return result;
      })
      .finally(() => {
        if (pending === request) pending = undefined;
      });
    pending = request;
    return request;
  }

  return {
    load,
    peek: () => value,
    invalidate() {
      revision++;
      value = undefined;
      pending = undefined;
    },
  };
}
