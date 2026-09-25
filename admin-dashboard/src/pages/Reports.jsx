import { useState } from "react";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { usePatients } from "../hooks/usePatients";
import { useUsers } from "../hooks/useUsers";
import { buildPatientReport, buildUserReport } from "../utils/reports";

function TrendTable({ title, trend }) {
  return (
    <div>
      <h3>{title}</h3>
      {trend.length === 0 ? (
        <p>No registrations for the selected filters.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>New</th>
            </tr>
          </thead>
          <tbody>
            {trend.map(({ month, label, value }) => (
              <tr key={month}>
                <td>{label}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Reports() {
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

  const [period, setPeriod] = useState("all");
  const [userCategory, setUserCategory] = useState("All");
  const [patientCategory, setPatientCategory] = useState("All");

  const loading = usersLoading || patientsLoading;
  const error = usersError || patientsError;
  const isEmpty = users.length === 0 && patients.length === 0;

  const userReport = buildUserReport(users, {
    period,
    category: userCategory,
  });
  const patientReport = buildPatientReport(patients, {
    period,
    category: patientCategory,
  });

  const userStatistics = [
    {
      id: "users-total",
      title: "Total Users",
      value: userReport.total,
      description: "In selected period",
    },
    {
      id: "users-active",
      title: "Active Users",
      value: userReport.active,
      description: "In selected period",
    },
    {
      id: "users-inactive",
      title: "Inactive Users",
      value: userReport.inactive,
      description: "In selected period",
    },
    {
      id: "users-favorite",
      title: "Favorite Users",
      value: userReport.favorite,
      description: "In selected period",
    },
  ];

  const patientStatistics = [
    {
      id: "patients-total",
      title: "Total Patients",
      value: patientReport.total,
      description: "In selected period",
    },
    {
      id: "patients-active",
      title: "Active Patients",
      value: patientReport.active,
      description: "In selected period",
    },
    {
      id: "patients-inactive",
      title: "Inactive Patients",
      value: patientReport.inactive,
      description: "In selected period",
    },
    {
      id: "patients-pending",
      title: "Pending Patients",
      value: patientReport.pending,
      description: "In selected period",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Derived statistics from users and patients"
      >
        <PageActions>
          <select
            name="report-period"
            id="report-period"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="all">All time</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
          </select>
        </PageActions>
      </PageHeader>

      {loading ? (
        <p>Loading reports...</p>
      ) : error ? (
        <p>{error}</p>
      ) : isEmpty ? (
        <p>No data available.</p>
      ) : (
        <>
          <section>
            <h2>User Reports</h2>
            <select
              name="report-user-category"
              id="report-user-category"
              value={userCategory}
              onChange={(event) => setUserCategory(event.target.value)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Favorites">Favorites</option>
            </select>

            <div className="stats-grid">
              {userStatistics.map(({ id, title, value, description }) => (
                <StatCard
                  key={id}
                  title={title}
                  value={value}
                  description={description}
                />
              ))}
            </div>

            <TrendTable
              title="Users created over time"
              trend={userReport.createdOverTime}
            />
          </section>

          <section>
            <h2>Patient Reports</h2>
            <select
              name="report-patient-category"
              id="report-patient-category"
              value={patientCategory}
              onChange={(event) => setPatientCategory(event.target.value)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>

            <div className="stats-grid">
              {patientStatistics.map(({ id, title, value, description }) => (
                <StatCard
                  key={id}
                  title={title}
                  value={value}
                  description={description}
                />
              ))}
            </div>

            <TrendTable
              title="Patients registered over time"
              trend={patientReport.createdOverTime}
            />
          </section>
        </>
      )}
    </div>
  );
}

export { Reports };
