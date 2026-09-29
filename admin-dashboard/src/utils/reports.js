import {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DISCHARGED,
  STATUS_PENDING,
  USER_STATUS_OPTIONS,
  PATIENT_STATUS_OPTIONS,
} from "../constants/statuses";
import { GENDER_OPTIONS } from "../constants/genders";
import { calculateAge } from "./patients";

const ALL_CATEGORIES = "All";
const FAVORITE_CATEGORY = "Favorites";
const UNKNOWN_LABEL = "Unknown";

const AGE_GROUPS = [
  { key: "0-17", label: "0-17", min: 0, max: 17 },
  { key: "18-34", label: "18-34", min: 18, max: 34 },
  { key: "35-44", label: "35-44", min: 35, max: 44 },
  { key: "45-64", label: "45-64", min: 45, max: 64 },
  { key: "65+", label: "65+", min: 65, max: Infinity },
];

const MAX_BAR_PERCENT = 100;

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
  if (!category || category === ALL_CATEGORIES) {
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

function toSharePercent(count, total) {
  if (!Number.isFinite(count) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

function toBarPercent(count, max) {
  if (!Number.isFinite(count) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }

  return Math.round((count / max) * MAX_BAR_PERCENT);
}

function buildBreakdownRows(entries, total) {
  const max = entries.reduce((highest, entry) => Math.max(highest, entry.count), 0);

  return entries.map((entry) => ({
    ...entry,
    share: toSharePercent(entry.count, total),
    bar: toBarPercent(entry.count, max),
  }));
}

function buildStatusBreakdown(items, statusOptions) {
  return buildBreakdownRows(
    statusOptions.map((status) => ({
      key: status,
      label: status,
      count: countBy(items, (item) => item.status === status),
    })),
    items.length,
  );
}

function buildGenderBreakdown(patients) {
  const entries = GENDER_OPTIONS.map((gender) => ({
    key: gender,
    label: gender,
    count: countBy(patients, (patient) => patient.gender === gender),
  }));

  const known = countBy(patients, (patient) =>
    GENDER_OPTIONS.includes(patient.gender),
  );

  if (patients.length > known) {
    entries.push({
      key: UNKNOWN_LABEL,
      label: UNKNOWN_LABEL,
      count: patients.length - known,
    });
  }

  return buildBreakdownRows(entries, patients.length);
}

function toAgeGroupKey(patient) {
  const age = calculateAge(patient.dateOfBirth);

  if (age === null || age < 0) {
    return UNKNOWN_LABEL;
  }

  const group = AGE_GROUPS.find(
    (candidate) => age >= candidate.min && age <= candidate.max,
  );

  return group ? group.key : UNKNOWN_LABEL;
}

function buildAgeGroupBreakdown(patients) {
  const entries = AGE_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    count: countBy(patients, (patient) => toAgeGroupKey(patient) === group.key),
  }));

  const unknown = countBy(patients, (patient) => toAgeGroupKey(patient) === UNKNOWN_LABEL);

  if (unknown > 0) {
    entries.push({
      key: UNKNOWN_LABEL,
      label: UNKNOWN_LABEL,
      count: unknown,
    });
  }

  return buildBreakdownRows(entries, patients.length);
}

function buildUserReport(
  users,
  { period = "all", category = ALL_CATEGORIES } = {},
) {
  const scopedUsers = filterByPeriod(users, (user) => user.createdAt, period);
  const reportUsers = filterByCategory(scopedUsers, category, (value) =>
    value === FAVORITE_CATEGORY
      ? (user) => user.isFavorite === true
      : (user) => user.status === value,
  );

  return {
    total: reportUsers.length,
    active: countBy(reportUsers, (user) => user.status === STATUS_ACTIVE),
    inactive: countBy(reportUsers, (user) => user.status === STATUS_INACTIVE),
    favorite: countBy(reportUsers, (user) => user.isFavorite === true),
    createdOverTime: groupByMonth(reportUsers, (user) => user.createdAt),
    statusBreakdown: buildStatusBreakdown(reportUsers, USER_STATUS_OPTIONS),
  };
}

function buildPatientReport(
  patients,
  { period = "all", category = ALL_CATEGORIES } = {},
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
    active: countBy(
      reportPatients,
      (patient) => patient.status === STATUS_ACTIVE,
    ),
    discharged: countBy(
      reportPatients,
      (patient) => patient.status === STATUS_DISCHARGED,
    ),
    pending: countBy(
      reportPatients,
      (patient) => patient.status === STATUS_PENDING,
    ),
    createdOverTime: groupByMonth(
      reportPatients,
      (patient) => patient.createdAt,
    ),
    statusBreakdown: buildStatusBreakdown(
      reportPatients,
      PATIENT_STATUS_OPTIONS,
    ),
    genderBreakdown: buildGenderBreakdown(reportPatients),
    ageGroupBreakdown: buildAgeGroupBreakdown(reportPatients),
  };
}

export {
  buildUserReport,
  buildPatientReport,
  buildStatusBreakdown,
  buildGenderBreakdown,
  buildAgeGroupBreakdown,
  groupByMonth,
  toSharePercent,
  toBarPercent,
  AGE_GROUPS,
};
