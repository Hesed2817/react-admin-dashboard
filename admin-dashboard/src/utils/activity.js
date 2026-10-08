const UNKNOWN_TIMESTAMP_LABEL = "Unknown time";

function toValidTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatActivityTimestamp(value) {
  const date = toValidTimestamp(value);

  return date ? date.toLocaleString() : UNKNOWN_TIMESTAMP_LABEL;
}

function describeActivityType(type) {
  if (typeof type !== "string" || type.trim() === "") {
    return "Event";
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function sortActivitiesNewestFirst(activities) {
  return [...activities]
    .map((activity, index) => ({ activity, index }))
    .sort((first, second) => {
      const firstDate = toValidTimestamp(first.activity.timestamp);
      const secondDate = toValidTimestamp(second.activity.timestamp);

      if (firstDate && secondDate) {
        const difference = secondDate.getTime() - firstDate.getTime();

        return difference !== 0 ? difference : first.index - second.index;
      }

      if (firstDate) {
        return -1;
      }

      if (secondDate) {
        return 1;
      }

      return first.index - second.index;
    })
    .map((entry) => entry.activity);
}

export {
  formatActivityTimestamp,
  describeActivityType,
  sortActivitiesNewestFirst,
  toValidTimestamp,
  UNKNOWN_TIMESTAMP_LABEL,
};
