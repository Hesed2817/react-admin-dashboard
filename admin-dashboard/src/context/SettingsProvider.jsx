import { useState, useEffect } from "react";
import {
  DEFAULT_SETTINGS,
  getStoredSettings,
  saveSettings,
  mergeSettings,
} from "../services/settingsStorage";
import { SettingsContext } from "./SettingsContext";

function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(
    () => getStoredSettings() || DEFAULT_SETTINGS,
  );

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  function updateSettings(partialSettings) {
    setSettings((previousSettings) =>
      mergeSettings(previousSettings, partialSettings),
    );
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);
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
