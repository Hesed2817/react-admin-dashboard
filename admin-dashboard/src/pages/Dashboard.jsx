import { useState } from "react";
import { Link } from "react-router";
import { EmptyState } from "../components/EmptyState";
import { FilterPills } from "../components/FilterPills";
import { Hero, HeroLink } from "../components/Hero";
import { QuickActions } from "../components/QuickActions";
import { RecentList } from "../components/RecentList";
import { StatCard } from "../components/StatCard";
import { StatHighlight } from "../components/StatHighlight";
import { StatusBadge } from "../components/StatusBadge";
import { TrendTable } from "../components/TrendTable";
import { useActivities } from "../hooks/useActivities";
import { usePatients } from "../hooks/usePatients";
import { useReportData } from "../hooks/useReportData";
import { useSettings } from "../hooks/useSettings";
import { useUsers } from "../hooks/useUsers";
import { formatActivityTimestamp } from "../utils/activity";
import { sortPatientsByCreatedAtDesc } from "../utils/patients";
import { ALL_CATEGORIES, REPORT_PERIODS } from "../utils/reports";
import {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DISCHARGED,
  STATUS_PENDING,
} from "../constants/statuses";

const RECENT_ACTIVITY_LIMIT = 8;
const RECENT_PATIENT_LIMIT = 5;
const ALL_PERIOD = "all";

// Every one of these navigates somewhere real. There is no "task" in this app,
// so the quick-action slot lists the things an operator actually does here
// instead of inventing a to-do list.
const QUICK_ACTIONS = [
  {
    to: "/patients",
    label: "Patients",
    description: "Add and manage patient records",
    icon: "patient",
  },
  {
    to: "/users",
    label: "Users",
    description: "Add and manage user accounts",
    icon: "users",
  },
  {
    to: "/reports",
    label: "Reports",
    description: "Period-filtered statistics",
    icon: "chart",
  },
  {
    to: "/activity",
    label: "Activity",
    description: "Every recorded change, newest first",
    icon: "history",
  },
];

function countByStatus(items, status) {
  return items.filter((item) => item.status === status).length;
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function toDateLabel(value) {
  if (!value) {
    return "No date on record";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No readable date";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Dashboard() {
  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useUsers();
  const {
    patients,
    loading: patientsLoading,
    error: patientsError,
  } = usePatients();
  const { activities } = useActivities();
  const { settings } = useSettings();
  const [period, setPeriod] = useState(ALL_PERIOD);

  // The analytics card does NOT re-derive anything. It reads the same hook the
  // Reports page reads, so the two can never disagree about a total.
  const {
    userReport,
    patientReport,
  } = useReportData({
    period,
    userCategory: ALL_CATEGORIES,
    patientCategory: ALL_CATEGORIES,
  });

  const recentActivities = activities.slice(0, RECENT_ACTIVITY_LIMIT);
  const recentPatients = sortPatientsByCreatedAtDesc(patients).slice(
    0,
    RECENT_PATIENT_LIMIT,
  );

  const loading = usersLoading || patientsLoading;
  const error = usersError || patientsError;
  const isEmpty = users.length === 0 && patients.length === 0;

  const activePatients = countByStatus(patients, STATUS_ACTIVE);
  const dischargedPatients = countByStatus(patients, STATUS_DISCHARGED);
  const pendingPatients = countByStatus(patients, STATUS_PENDING);
  const activeUsers = countByStatus(users, STATUS_ACTIVE);
  const inactiveUsers = countByStatus(users, STATUS_INACTIVE);
  const favoriteUsers = users.filter((user) => user.isFavorite === true).length;

  // Every value below is computed from the shared stores. Nothing here is a
  // stored copy or a hardcoded figure.
  const statistics = [
    { id: 1, title: "Total Users", value: users.length, description: "Registered users" },
    { id: 2, title: "Active Users", value: activeUsers, description: "Currently active" },
    { id: 3, title: "Inactive Users", value: inactiveUsers, description: "Currently inactive" },
    { id: 4, title: "Favorite Users", value: favoriteUsers, description: "Marked as favorite" },
    { id: 5, title: "Total Patients", value: patients.length, description: "Registered patients" },
    { id: 6, title: "Active Patients", value: activePatients, description: "Currently under care" },
    { id: 7, title: "Discharged Patients", value: dischargedPatients, description: "No longer under care" },
    { id: 8, title: "Pending Patients", value: pendingPatients, description: "Awaiting review" },
  ];

  const profileName = settings.profile.name.trim();
  const greeting = profileName
    ? `Welcome back, ${profileName}`
    : "Welcome to the admin dashboard";

  const summary = `${pluralize(patients.length, "patient record")} and ${pluralize(
    users.length,
    "user account",
  )} on record, ${pluralize(activePatients, "patient")} currently under care.`;

  return (
    <>
      {loading ? (
        <div className="loading" role="status" aria-live="polite">
          <span>Loading statistics...</span>
          <span className="loading__bar" />
          <span className="loading__bar" />
        </div>
      ) : error ? (
        <p className="inline-message inline-message--error" role="alert">
          {error}
        </p>
      ) : (
        <>
          <Hero title={greeting} message={summary}>
            <HeroLink to="/patients">Open patients</HeroLink>
          </Hero>

          {isEmpty ? (
            <EmptyState
              title="No data available"
              message="Add your first user or patient and the statistics will appear here."
            />
          ) : (
            <>
              {/* Patients get the single large number because they are this
                  app's primary record type and the only entity with a care
                  lifecycle. Users and patients both appear again in the grid
                  below, so nothing is hidden by the choice. */}
              <div className="dashboard-top">
                <StatHighlight
                  label="Total patients"
                  value={patients.length}
                  description={`${activePatients} Under care · ${dischargedPatients} Discharged · ${pendingPatients} Awaiting review`}
                  mediaLabel="Patient records illustration placeholder"
                />
                <QuickActions
                  title="Quick actions"
                  items={QUICK_ACTIONS}
                />
              </div>

              <div className="stats-grid">
                {statistics.map(({ id, title, value, description }) => (
                  <StatCard
                    key={id}
                    title={title}
                    value={value}
                    description={description}
                  />
                ))}
              </div>

              <div className="dashboard-columns">
                <section className="card analytics" aria-labelledby="analytics-heading">
                  <div className="analytics__header">
                    <h2 id="analytics-heading">Analytics</h2>
                    <FilterPills
                      label="Reporting period"
                      options={REPORT_PERIODS}
                      value={period}
                      onChange={setPeriod}
                    />
                  </div>

                  <TrendTable
                    title="Patients registered over time"
                    trend={patientReport.createdOverTime}
                    showBar
                  />
                  <TrendTable
                    title="Users created over time"
                    trend={userReport.createdOverTime}
                    showBar
                  />
                </section>

                <RecentList
                  title="Recent patients"
                  items={recentPatients.map((patient) => ({
                    id: patient.id,
                    name: patient.name,
                    meta: toDateLabel(patient.createdAt),
                    trailing: <StatusBadge status={patient.status} />,
                  }))}
                  emptyMessage="No patients yet."
                  footer={
                    <p className="section__footer">
                      <Link to="/patients">View all patients</Link>
                    </p>
                  }
                />
              </div>
            </>
          )}

          <section className="section card">
            <div className="section__header">
              <h2>Recent Activity</h2>
            </div>

            {recentActivities.length === 0 ? (
              <p className="field-hint">No recent activity.</p>
            ) : (
              <ul className="activity-list">
                {recentActivities.map((activity) => (
                  <li className="activity-list__item" key={activity.id}>
                    <span className="activity-list__message">
                      {activity.message}
                    </span>
                    <span className="activity-list__time">
                      {formatActivityTimestamp(activity.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <p className="section__footer">
              <Link to="/activity">View all activity</Link>
            </p>
          </section>
        </>
      )}
    </>
  );
}

export { Dashboard };
