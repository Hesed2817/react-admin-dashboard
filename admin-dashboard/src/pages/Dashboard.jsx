import { Link } from "react-router";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { useUsers } from "../hooks/useUsers";
import { usePatients } from "../hooks/usePatients";
import { useActivities } from "../hooks/useActivities";
import { formatActivityTimestamp } from "../utils/activity";
import {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DISCHARGED,
  STATUS_PENDING,
} from "../constants/statuses";

const RECENT_ACTIVITY_LIMIT = 8;

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

  const recentActivities = activities.slice(0, RECENT_ACTIVITY_LIMIT);

  const loading = usersLoading || patientsLoading;
  const error = usersError || patientsError;
  const isEmpty = users.length === 0 && patients.length === 0;

  // Every value below is computed from the shared stores. Nothing here is a
  // stored copy or a hardcoded figure.
  const statistics = [
    {
      id: 1,
      title: "Total Users",
      value: users.length,
      description: "Registered users",
    },
    {
      id: 2,
      title: "Active Users",
      value: users.filter((user) => user.status === STATUS_ACTIVE).length,
      description: "Currently active",
    },
    {
      id: 3,
      title: "Inactive Users",
      value: users.filter((user) => user.status === STATUS_INACTIVE).length,
      description: "Currently inactive",
    },
    {
      id: 4,
      title: "Favorite Users",
      value: users.filter((user) => user.isFavorite === true).length,
      description: "Marked as favorite",
    },
    {
      id: 5,
      title: "Total Patients",
      value: patients.length,
      description: "Registered patients",
    },
    {
      id: 6,
      title: "Active Patients",
      value: patients.filter((patient) => patient.status === STATUS_ACTIVE)
        .length,
      description: "Currently under care",
    },
    {
      id: 7,
      title: "Discharged Patients",
      value: patients.filter((patient) => patient.status === STATUS_DISCHARGED)
        .length,
      description: "No longer under care",
    },
    {
      id: 8,
      title: "Pending Patients",
      value: patients.filter((patient) => patient.status === STATUS_PENDING)
        .length,
      description: "Awaiting review",
    },
  ];

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <span>Loading statistics...</span>
        <span className="loading__bar" />
        <span className="loading__bar" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="inline-message inline-message--error" role="alert">
        {error}
      </p>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard Overview"
        description="Live totals computed from the Users and Patients stores."
      />

      {isEmpty ? (
        <EmptyState
          title="No data available"
          message="Add your first user or patient and the statistics will appear here."
        />
      ) : (
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
      )}

      <section className="section">
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
  );
}

export { Dashboard };
