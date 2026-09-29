import { useState } from "react";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { TrendTable } from "../components/TrendTable";
import { BreakdownTable } from "../components/BreakdownTable";
import { useReportData } from "../hooks/useReportData";
import {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DISCHARGED,
  STATUS_PENDING,
} from "../constants/statuses";

const ALL_CATEGORIES = "All";
const FAVORITE_CATEGORY = "Favorites";

function Reports() {
  const [period, setPeriod] = useState("all");
  const [userCategory, setUserCategory] = useState(ALL_CATEGORIES);
  const [patientCategory, setPatientCategory] = useState(ALL_CATEGORIES);

  const {
    loading,
    error,
    isEmpty,
    userReport,
    patientReport,
    userStatistics,
    patientStatistics,
  } = useReportData({ period, userCategory, patientCategory });

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
              <option value={ALL_CATEGORIES}>All</option>
              <option value={STATUS_ACTIVE}>Active</option>
              <option value={STATUS_INACTIVE}>Inactive</option>
              <option value={FAVORITE_CATEGORY}>Favorites</option>
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

            <BreakdownTable
              title="Users by status"
              rows={userReport.statusBreakdown}
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
              <option value={ALL_CATEGORIES}>All</option>
              <option value={STATUS_ACTIVE}>Active</option>
              <option value={STATUS_DISCHARGED}>Discharged</option>
              <option value={STATUS_PENDING}>Pending</option>
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

            <BreakdownTable
              title="Patients by status"
              rows={patientReport.statusBreakdown}
            />

            <BreakdownTable
              title="Patients by gender"
              rows={patientReport.genderBreakdown}
            />

            <BreakdownTable
              title="Patients by age group"
              rows={patientReport.ageGroupBreakdown}
            />
          </section>
        </>
      )}
    </div>
  );
}

export { Reports };
