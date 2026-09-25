import { useState, useEffect } from "react";
import {
  getStoredActivities,
  saveActivities,
  appendActivity,
} from "../services/activityStorage";
import { ActivityContext } from "./ActivityContext";

const MAX_ACTIVITIES = 100;

function ActivityProvider({ children }) {
  const [activities, setActivities] = useState(
    () => getStoredActivities() || [],
  );

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  function recordActivity({ type, message, entityType, entityId }) {
    const activity = {
      type,
      message,
      timestamp: new Date().toISOString(),
      entityType,
      entityId,
    };

    setActivities((previousActivities) =>
      appendActivity(previousActivities, activity, MAX_ACTIVITIES),
    );
  }

  function clearActivities() {
    setActivities([]);
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
