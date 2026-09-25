import { StatCard } from "../components/StatCard";
import { useUsers } from "../hooks/useUsers";
import { usePatients } from "../hooks/usePatients";
import { useActivities } from "../hooks/useActivities";

const PENDING_REQUESTS = 18;
const RECENT_ACTIVITY_LIMIT = 5;

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
      value: users.filter((user) => user.status === "Active").length,
      description: "Currently active",
    },
    {
      id: 3,
      title: "Inactive Users",
      value: users.filter((user) => user.status === "Inactive").length,
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
      title: "Pending Requests",
      value: PENDING_REQUESTS,
      description: "Awaiting review",
    },
    {
      id: 6,
      title: "Total Patients",
      value: patients.length,
      description: "Registered patients",
    },
    {
      id: 7,
      title: "Active Patients",
      value: patients.filter((patient) => patient.status === "Active").length,
      description: "Currently active",
    },
    {
      id: 8,
      title: "Inactive Patients",
      value: patients.filter((patient) => patient.status === "Inactive")
        .length,
      description: "Currently inactive",
    },
    {
      id: 9,
      title: "Pending Patients",
      value: patients.filter((patient) => patient.status === "Pending").length,
      description: "Awaiting review",
    },
  ];

  return (
    <>
      <h1>Dashboard Overview</h1>
      <p>Welcome to your admin dashboard.</p>

      {loading ? (
        <p>Loading statistics...</p>
      ) : error ? (
        <p>{error}</p>
      ) : isEmpty ? (
        <p>No data available.</p>
      ) : (
        <>
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

          <section>
            <h2>Recent Activity</h2>
            {recentActivities.length === 0 ? (
              <p>No recent activity.</p>
            ) : (
              <ul>
                {recentActivities.map((activity) => (
                  <li key={activity.id}>
                    {activity.message} —{" "}
                    {new Date(activity.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}

export { Dashboard };
