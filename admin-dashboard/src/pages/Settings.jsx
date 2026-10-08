import { useState } from "react";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useSettings } from "../hooks/useSettings";
import { useUsers } from "../hooks/useUsers";
import { usePatients } from "../hooks/usePatients";
import { useActivities } from "../hooks/useActivities";
import { DEFAULT_SETTINGS } from "../services/settingsStorage";

function Settings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { users, resetUsers } = useUsers();
  const { patients, resetPatients } = usePatients();
  const { recordActivity, clearActivities } = useActivities();
  const [formData, setFormData] = useState(settings);
  const [saveMessage, setSaveMessage] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

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

  async function handleConfirmResetDemoData() {
    await Promise.all([resetUsers(), resetPatients()]);

    clearActivities();
    recordActivity({
      type: "reset",
      message:
        "Demo data reset: users and patients restored to the original sample records, activity log cleared",
      entityType: "settings",
      entityId: 0,
    });

    setIsResetModalOpen(false);
    setSaveMessage(
      `Demo data reset. ${users.length} user records and ${patients.length} patient records were replaced with the original sample data.`,
    );
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage profile and application preferences"
      />

      {saveMessage && (
        <p className="inline-message" role="status">
          {saveMessage}
        </p>
      )}

      <form className="form" onSubmit={handleSave}>
        <section className="card">
          <h2>Profile</h2>

          <div className="form-grid">
            <Field label="Name">
              {(controlProps) => (
                <input
                  type="text"
                  className="field-control"
                  value={formData.profile.name}
                  onChange={(event) =>
                    handleProfileChange("name", event.target.value)
                  }
                  {...controlProps}
                />
              )}
            </Field>

            <Field label="Email">
              {(controlProps) => (
                <input
                  type="email"
                  className="field-control"
                  value={formData.profile.email}
                  onChange={(event) =>
                    handleProfileChange("email", event.target.value)
                  }
                  {...controlProps}
                />
              )}
            </Field>

            <Field label="Role" className="field--full">
              {(controlProps) => (
                <input
                  type="text"
                  className="field-control"
                  value={formData.profile.role}
                  onChange={(event) =>
                    handleProfileChange("role", event.target.value)
                  }
                  {...controlProps}
                />
              )}
            </Field>
          </div>
        </section>

        <section className="card">
          <h2>Notifications</h2>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={formData.notifications.email}
              onChange={(event) =>
                handleNotificationChange("email", event.target.checked)
              }
            />
            <span>Email notifications</span>
          </label>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={formData.notifications.system}
              onChange={(event) =>
                handleNotificationChange("system", event.target.checked)
              }
            />
            <span>System notifications</span>
          </label>
        </section>

        <section className="card">
          <h2>Appearance</h2>

          <Field
            label="Theme"
            hint="Stored with your settings. The app currently renders the light theme only."
          >
            {(controlProps) => (
              <select
                className="field-control"
                value={formData.appearance.theme}
                onChange={(event) => handleAppearanceChange(event.target.value)}
                {...controlProps}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            )}
          </Field>
        </section>

        <div className="form-actions">
          <Button type="submit" variant="primary">
            Save Settings
          </Button>
          <Button type="button" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </div>
      </form>

      <section className="section">
        <div className="section__header">
          <h2>Demo data</h2>
        </div>
        <p className="page-header__description">
          Restore the original sample users and patients, and clear the activity
          log. Your settings above are not affected.
        </p>
        <div className="form-actions">
          <Button variant="danger" onClick={() => setIsResetModalOpen(true)}>
            Reset demo data
          </Button>
        </div>
      </section>

      {isResetModalOpen && (
        <Modal
          title="Reset demo data"
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleConfirmResetDemoData}
          confirmLabel="Reset demo data"
          confirmVariant="danger"
        >
          <p>
            This permanently deletes all {users.length} user records, all{" "}
            {patients.length} patient records and the entire activity log, then
            restores the original sample data. This cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

export { Settings };
