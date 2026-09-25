const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const PERIOD_MONTHS = {
  all: null,
  "6m": 6,
  "12m": 12,
};

function toValidDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function filterByPeriod(items, getDate, period) {
  const months = PERIOD_MONTHS[period];

  if (!months) {
    return items;
  }

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  return items.filter((item) => {
    const date = toValidDate(getDate(item));

    return date !== null && date >= cutoff;
  });
}

function filterByCategory(items, category, predicateFor) {
  if (!category || category === "All") {
    return items;
  }

  return items.filter(predicateFor(category));
}

function countBy(items, predicate) {
  return items.filter(predicate).length;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");

  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

function groupByMonth(items, getDate) {
  const counts = new Map();

  items.forEach((item) => {
    const date = toValidDate(getDate(item));

    if (!date) {
      return;
    }

    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    counts.set(monthKey, (counts.get(monthKey) || 0) + 1);
  });

  return [...counts.entries()]
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([month, value]) => ({
      month,
      label: formatMonthLabel(month),
      value,
    }));
}

function buildUserReport(users, { period = "all", category = "All" } = {}) {
  const scopedUsers = filterByPeriod(users, (user) => user.createdAt, period);
  const reportUsers = filterByCategory(scopedUsers, category, (value) =>
    value === "Favorites"
      ? (user) => user.isFavorite === true
      : (user) => user.status === value,
  );

  return {
    total: reportUsers.length,
    active: countBy(reportUsers, (user) => user.status === "Active"),
    inactive: countBy(reportUsers, (user) => user.status === "Inactive"),
    favorite: countBy(reportUsers, (user) => user.isFavorite === true),
    createdOverTime: groupByMonth(reportUsers, (user) => user.createdAt),
  };
}

function buildPatientReport(
  patients,
  { period = "all", category = "All" } = {},
) {
  const scopedPatients = filterByPeriod(
    patients,
    (patient) => patient.createdAt,
    period,
  );
  const reportPatients = filterByCategory(
    scopedPatients,
    category,
    (value) => (patient) => patient.status === value,
  );

  return {
    total: reportPatients.length,
    active: countBy(reportPatients, (patient) => patient.status === "Active"),
    inactive: countBy(
      reportPatients,
      (patient) => patient.status === "Inactive",
    ),
    pending: countBy(reportPatients, (patient) => patient.status === "Pending"),
    createdOverTime: groupByMonth(
      reportPatients,
      (patient) => patient.createdAt,
    ),
  };
}

export { buildUserReport, buildPatientReport, groupByMonth };
