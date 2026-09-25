import {
  STORAGE_SCHEMA_VERSION,
  LEGACY_STORAGE_SCHEMA_VERSION,
} from "../constants/storage";

const STORAGE_KEY = "admin-dashboard.settings";

const DEFAULT_SETTINGS = {
  profile: {
    name: "",
    email: "",
    role: "",
  },
  notifications: {
    email: true,
    system: true,
  },
  appearance: {
    theme: "light",
  },
};

function withDefaults(storedSettings) {
  return {
    profile: { ...DEFAULT_SETTINGS.profile, ...(storedSettings.profile || {}) },
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...(storedSettings.notifications || {}),
    },
    appearance: {
      ...DEFAULT_SETTINGS.appearance,
      ...(storedSettings.appearance || {}),
    },
  };
}

function mergeSettings(previousSettings, partialSettings) {
  return {
    profile: {
      ...previousSettings.profile,
      ...(partialSettings.profile || {}),
    },
    notifications: {
      ...previousSettings.notifications,
      ...(partialSettings.notifications || {}),
    },
    appearance: {
      ...previousSettings.appearance,
      ...(partialSettings.appearance || {}),
    },
  };
}

function isEnvelope(parsed) {
  return (
    parsed !== null &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    "version" in parsed &&
    "data" in parsed
  );
}

function getStoredSettings() {
  try {
    const rawSettings = localStorage.getItem(STORAGE_KEY);

    if (!rawSettings) {
      return null;
    }

    const parsed = JSON.parse(rawSettings);

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const version = isEnvelope(parsed) ? parsed.version : LEGACY_STORAGE_SCHEMA_VERSION;

    if (typeof version !== "number" || version > STORAGE_SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const settings = withDefaults(isEnvelope(parsed) ? parsed.data : parsed);

    if (version !== STORAGE_SCHEMA_VERSION) {
      saveSettings(settings);
    }

    return settings;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_SCHEMA_VERSION, data: settings }),
    );
  } catch {
    return;
  }
}

export { DEFAULT_SETTINGS, getStoredSettings, saveSettings, mergeSettings };
