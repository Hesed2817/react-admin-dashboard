import { useState, useEffect } from "react";
import {
  DEFAULT_SETTINGS,
  getStoredSettings,
  saveSettings,
  mergeSettings,
} from "../services/settingsStorage";
import { diffSettings, summarizeSettingsChanges } from "../utils/settings";
import { useActivities } from "../hooks/useActivities";
import { SettingsContext } from "./SettingsContext";

const SETTINGS_ENTITY_ID = 0;

function SettingsProvider({ children }) {
  const { recordActivity } = useActivities();
  const [settings, setSettings] = useState(
    () => getStoredSettings() || DEFAULT_SETTINGS,
  );

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  function updateSettings(partialSettings) {
    const nextSettings = mergeSettings(settings, partialSettings);
    const changes = diffSettings(settings, nextSettings);

    setSettings(nextSettings);

    if (changes.length > 0) {
      recordActivity({
        type: "updated",
        message: summarizeSettingsChanges(changes),
        entityType: "settings",
        entityId: SETTINGS_ENTITY_ID,
      });
    }
  }

  function resetSettings() {
    const changes = diffSettings(settings, DEFAULT_SETTINGS);

    setSettings(DEFAULT_SETTINGS);

    if (changes.length > 0) {
      recordActivity({
        type: "reset",
        message: "Settings reset to defaults",
        entityType: "settings",
        entityId: SETTINGS_ENTITY_ID,
      });
    }
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
