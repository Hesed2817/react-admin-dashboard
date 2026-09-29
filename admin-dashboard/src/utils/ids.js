function nextId(items) {
  const takenIds = new Set(items.map((item) => String(item.id)));

  let candidate =
    items.reduce((maxId, item) => {
      const numericId = Number(item.id);

      return Number.isFinite(numericId) ? Math.max(maxId, numericId) : maxId;
    }, 0) + 1;

  while (takenIds.has(String(candidate))) {
    candidate += 1;
  }

  return candidate;
}

export { nextId };
