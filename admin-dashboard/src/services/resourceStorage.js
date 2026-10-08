import {
  STORAGE_SCHEMA_VERSION,
  LEGACY_STORAGE_SCHEMA_VERSION,
} from "../constants/storage";

function createStorage(
  storageKey,
  isValidItem,
  migrations = {},
  { discardInvalidItems = false } = {},
) {
  const migrationSteps = {
    [LEGACY_STORAGE_SCHEMA_VERSION]: (data) => data,
    ...migrations,
  };

  function readEnvelope(parsed) {
    if (Array.isArray(parsed)) {
      return { version: LEGACY_STORAGE_SCHEMA_VERSION, data: parsed };
    }

    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "version" in parsed &&
      "data" in parsed
    ) {
      return parsed;
    }

    return null;
  }

  function migrate(envelope) {
    if (
      typeof envelope.version !== "number" ||
      envelope.version < 0 ||
      envelope.version > STORAGE_SCHEMA_VERSION
    ) {
      return null;
    }

    let data = envelope.data;

    for (let version = envelope.version; version < STORAGE_SCHEMA_VERSION; version += 1) {
      const migration = migrationSteps[version];

      if (typeof migration !== "function") {
        return null;
      }

      data = migration(data);
    }

    return data;
  }

  function getStoredItems() {
    try {
      const rawItems = localStorage.getItem(storageKey);

      if (!rawItems) {
        return null;
      }

      const envelope = readEnvelope(JSON.parse(rawItems));

      if (!envelope) {
        localStorage.removeItem(storageKey);
        return null;
      }

      const items = migrate(envelope);

      if (!Array.isArray(items)) {
        localStorage.removeItem(storageKey);
        return null;
      }

      const validItems = discardInvalidItems
        ? items.filter(isValidItem)
        : items.every(isValidItem)
          ? items
          : null;

      if (validItems === null) {
        localStorage.removeItem(storageKey);
        return null;
      }

      const discardedCount = items.length - validItems.length;

      if (discardedCount > 0 && Boolean(import.meta.env?.DEV)) {
        console.warn(
          `Discarded ${discardedCount} invalid record(s) from "${storageKey}".`,
        );
      }

      if (items.length > 0 && validItems.length === 0) {
        localStorage.removeItem(storageKey);
        return null;
      }

      if (
        discardedCount > 0 ||
        envelope.version !== STORAGE_SCHEMA_VERSION
      ) {
        saveItems(validItems);
      }

      return validItems;
    } catch {
      localStorage.removeItem(storageKey);
      return null;
    }
  }

  function saveItems(items) {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ version: STORAGE_SCHEMA_VERSION, data: items }),
      );
    } catch {
      return;
    }
  }

  return { getStoredItems, saveItems };
}

export { createStorage };
