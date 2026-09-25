import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useSettings } from "../hooks/useSettings";
import { DEFAULT_SETTINGS } from "../services/settingsStorage";

function Settings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [saveMessage, setSaveMessage] = useState("");

  function handleProfileChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  }

  function handleNotificationChange(field, checked) {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: checked,
      },
    }));
  }

  function handleAppearanceChange(value) {
    setFormData((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme: value,
      },
    }));
  }

  function handleSave(event) {
    event.preventDefault();
    updateSettings(formData);
    setSaveMessage("Settings saved.");
  }

  function handleReset() {
    resetSettings();
    setFormData(DEFAULT_SETTINGS);
    setSaveMessage("Settings reset to defaults.");
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage profile and application preferences"
      />

      {saveMessage && <p>{saveMessage}</p>}

      <form className="edit-user-form" onSubmit={handleSave}>
        <h2>Profile</h2>
        <input
          type="text"
          placeholder="Name"
          value={formData.profile.name}
          onChange={(event) => handleProfileChange("name", event.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.profile.email}
          onChange={(event) => handleProfileChange("email", event.target.value)}
        />
        <input
          type="text"
          placeholder="Role"
          value={formData.profile.role}
          onChange={(event) => handleProfileChange("role", event.target.value)}
        />

        <h2>Notifications</h2>
        <label>
          <input
            type="checkbox"
            checked={formData.notifications.email}
            onChange={(event) =>
              handleNotificationChange("email", event.target.checked)
            }
          />
          Email notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.notifications.system}
            onChange={(event) =>
              handleNotificationChange("system", event.target.checked)
            }
          />
          System notifications
        </label>

        <h2>Appearance</h2>
        <select
          value={formData.appearance.theme}
          onChange={(event) => handleAppearanceChange(event.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>

        <button type="submit">Save Settings</button>
        <button type="button" onClick={handleReset}>
          Reset to Defaults
        </button>
      </form>
    </div>
  );
}

export { Settings };
