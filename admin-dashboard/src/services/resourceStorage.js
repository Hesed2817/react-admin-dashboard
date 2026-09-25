function createStorage(storageKey, isValidItem) {
  function getStoredItems() {
    try {
      const rawItems = localStorage.getItem(storageKey);

      if (!rawItems) {
        return null;
      }

      const parsedItems = JSON.parse(rawItems);

      if (!Array.isArray(parsedItems) || !parsedItems.every(isValidItem)) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return parsedItems;
    } catch {
      localStorage.removeItem(storageKey);
      return null;
    }
  }

  function saveItems(items) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      return;
    }
  }

  return { getStoredItems, saveItems };
}

export { createStorage };
