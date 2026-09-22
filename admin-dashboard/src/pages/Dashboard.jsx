import { StatCard } from "../components/StatCard";

function Dashboard() {
  const statistics = [
    {
      id: 1,
      title: "Total Users",
      value: "1,248",
      description: "Registered users",
    },
    {
      id: 2,
      title: "Patients",
      value: "3,842",
      description: "Total patients",
    },
    {
      id: 3,
      title: "Appointments",
      value: "156",
      description: "This month",
    },
    {
      id: 4,
      title: "Reports",
      value: "42",
      description: "Generated reports",
    },
    {
      id: 5,
      title: "Pending Requests",
      value: "18",
      description: "Awaiting review",
    },
  ];
  return (
    <>
      <h1>Dashboard Overview</h1>
      <p>Welcome to your admin dashboard.</p>

      <div className="stats-grid">
        {statistics.map(({ id, title, value, description }) => (
          <StatCard key={id} title={title} value={value} description={description}/>
        ))}
      </div>
    </>
  );
}

export { Dashboard };
