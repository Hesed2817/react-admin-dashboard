import { createStorage } from "./resourceStorage";

// Shell appearance preferences (currently just the sidebar's collapsed
// state). This is NOT a new storage pattern: it is the same createStorage
// helper, the same { version, data } envelope, the same
// STORAGE_SCHEMA_VERSION and the same fail-closed behaviour as every other
// stored resource in the app. Preferences are not records, so they are stored
// as a small keyed list rather than inventing a second envelope reader.
//
// Not in the Settings store: Settings is user-profile data that belongs to
// the person and is edited on a page. Whether the sidebar is folded is a
// property of this browser's window, not of the user, and reapplying it to a
// different account on the same browser would be wrong.

const STORAGE_KEY = "admin-dashboard.shell-preferences";

const COLLAPSED_KEY = "sidebarCollapsed";

function isValidPreference(preference) {
  return (
    preference !== null &&
    typeof preference === "object" &&
    typeof preference.key === "string" &&
    typeof preference.value === "boolean"
  );
}

const { getStoredItems: getStoredShellPreferences, saveItems: saveShellPreferences } =
  createStorage(STORAGE_KEY, isValidPreference);

function getStoredSidebarCollapsed() {
  const preferences = getStoredShellPreferences();

  if (!preferences) {
    return null;
  }

  return preferences.find((preference) => preference.key === COLLAPSED_KEY)?.value ?? null;
}

function saveSidebarCollapsed(isCollapsed) {
  const preferences = getStoredShellPreferences() ?? [];

  saveShellPreferences([
    ...preferences.filter((preference) => preference.key !== COLLAPSED_KEY),
    { key: COLLAPSED_KEY, value: isCollapsed === true },
  ]);
}

export {
  STORAGE_KEY,
  COLLAPSED_KEY,
  getStoredShellPreferences,
  getStoredSidebarCollapsed,
  saveSidebarCollapsed,
};
