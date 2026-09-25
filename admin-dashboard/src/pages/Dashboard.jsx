import { StatCard } from "../components/StatCard";
import { useUsers } from "../hooks/useUsers";

const PENDING_REQUESTS = 18;

function Dashboard() {
  const { users, loading, error } = useUsers();

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
  ];

  return (
    <>
      <h1>Dashboard Overview</h1>
      <p>Welcome to your admin dashboard.</p>

      {loading ? (
        <p>Loading statistics...</p>
      ) : error ? (
        <p>{error}</p>
      ) : users.length === 0 ? (
        <p>No users available.</p>
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
    </>
  );
}

export { Dashboard };
