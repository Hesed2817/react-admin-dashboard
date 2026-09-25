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

function getStoredSettings() {
  try {
    const rawSettings = localStorage.getItem(STORAGE_KEY);

    if (!rawSettings) {
      return null;
    }

    const parsedSettings = JSON.parse(rawSettings);

    if (
      parsedSettings === null ||
      typeof parsedSettings !== "object" ||
      Array.isArray(parsedSettings)
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return withDefaults(parsedSettings);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}

export { DEFAULT_SETTINGS, getStoredSettings, saveSettings };
