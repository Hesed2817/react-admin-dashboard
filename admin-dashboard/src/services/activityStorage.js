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

const { getStoredItems: getStoredActivities, saveItems: saveActivities } =
  createStorage(STORAGE_KEY, isValidActivity);

export { getStoredActivities, saveActivities };
