import { useState } from "react";
import {
  getStoredActivities,
  saveActivities,
} from "../services/activityStorage";
import { ActivityContext } from "./ActivityContext";

const MAX_ACTIVITIES = 100;

function ActivityProvider({ children }) {
  const [activities, setActivities] = useState(
    () => getStoredActivities() || [],
  );

  function recordActivity({ type, message, entityType, entityId }) {
    const nextId =
      activities.reduce(
        (maxId, activity) => Math.max(maxId, Number(activity.id) || 0),
        0,
      ) + 1;

    const activity = {
      id: nextId,
      type,
      message,
      timestamp: new Date().toISOString(),
      entityType,
      entityId,
    };

    const nextActivities = [activity, ...activities].slice(0, MAX_ACTIVITIES);

    setActivities(nextActivities);
    saveActivities(nextActivities);
  }

  function clearActivities() {
    setActivities([]);
    saveActivities([]);
  }

  return (
    <ActivityContext.Provider
      value={{ activities, recordActivity, clearActivities }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export { ActivityProvider };
