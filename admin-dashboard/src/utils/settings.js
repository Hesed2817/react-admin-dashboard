const SETTINGS_SECTIONS = ["profile", "notifications", "appearance"];

function diffSettings(previousSettings, nextSettings) {
  if (!previousSettings || !nextSettings) {
    return [];
  }

  const changes = [];

  SETTINGS_SECTIONS.forEach((section) => {
    const previousSection = previousSettings[section] || {};
    const nextSection = nextSettings[section] || {};

    Object.keys(nextSection).forEach((field) => {
      if (previousSection[field] === nextSection[field]) {
        return;
      }

      changes.push({
        section,
        field,
        from: previousSection[field],
        to: nextSection[field],
      });
    });
  });

  return changes;
}

function summarizeSettingsChanges(changes) {
  if (!Array.isArray(changes) || changes.length === 0) {
    return null;
  }

  const fields = changes.map((change) => `${change.section}.${change.field}`);

  return `Settings updated (${fields.join(", ")})`;
}

export { diffSettings, summarizeSettingsChanges };
