import { createStorage } from "./resourceStorage";

const STORAGE_KEY = "admin-dashboard.activities";

function isValidActivity(activity) {
  return (
    activity !== null &&
    typeof activity === "object" &&
    (typeof activity.id === "number" || typeof activity.id === "string") &&
    typeof activity.type === "string" &&
    typeof activity.message === "string" &&
    typeof activity.timestamp === "string" &&
    typeof activity.entityType === "string" &&
    (typeof activity.entityId === "number" ||
      typeof activity.entityId === "string")
  );
}

function appendActivity(activities, activity, maxActivities) {
  const nextId =
    activities.reduce(
      (maxId, storedActivity) =>
        Math.max(maxId, Number(storedActivity.id) || 0),
      0,
    ) + 1;

  return [{ ...activity, id: nextId }, ...activities].slice(0, maxActivities);
}

const { getStoredItems: getStoredActivities, saveItems: saveActivities } =
  createStorage(STORAGE_KEY, isValidActivity);

export { getStoredActivities, saveActivities, appendActivity };
