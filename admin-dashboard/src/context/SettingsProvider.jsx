import { useState } from "react";
import {
  DEFAULT_SETTINGS,
  getStoredSettings,
  saveSettings,
} from "../services/settingsStorage";
import { SettingsContext } from "./SettingsContext";

function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(
    () => getStoredSettings() || DEFAULT_SETTINGS,
  );

  function updateSettings(partialSettings) {
    const nextSettings = {
      profile: {
        ...settings.profile,
        ...(partialSettings.profile || {}),
      },
      notifications: {
        ...settings.notifications,
        ...(partialSettings.notifications || {}),
      },
      appearance: {
        ...settings.appearance,
        ...(partialSettings.appearance || {}),
      },
    };

    setSettings(nextSettings);
    saveSettings(nextSettings);
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export { SettingsProvider };
