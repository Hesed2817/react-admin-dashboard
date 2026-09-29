import { useState } from "react";
import { Field } from "../components/Field";
import { FilterPills } from "../components/FilterPills";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { TrendTable } from "../components/TrendTable";
import { BreakdownTable } from "../components/BreakdownTable";
import { EmptyState } from "../components/EmptyState";
import { useReportData } from "../hooks/useReportData";
import { ALL_CATEGORIES, REPORT_PERIODS } from "../utils/reports";
import {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DISCHARGED,
  STATUS_PENDING,
} from "../constants/statuses";

const FAVORITE_CATEGORY = "Favorites";

function Reports() {
  const [period, setPeriod] = useState(REPORT_PERIODS[0].value);
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
        <PageActions label="Report filters">
          <FilterPills
            label="Reporting period"
            options={REPORT_PERIODS}
            value={period}
            onChange={setPeriod}
          />
        </PageActions>
      </PageHeader>

      {loading ? (
        <div className="loading" role="status" aria-live="polite">
          <span>Loading reports...</span>
          <span className="loading__bar" />
        </div>
      ) : error ? (
        <p className="inline-message inline-message--error" role="alert">
          {error}
        </p>
      ) : isEmpty ? (
        <EmptyState
          title="No data available"
          message="Add users or patients and the reports will be built from them."
          icon="inbox"
        />
      ) : (
        <>
          <section className="section">
            <div className="section__header">
              <h2>User Reports</h2>
              <Field label="User category">
                {(controlProps) => (
                  <select
                    className="field-control"
                    value={userCategory}
                    onChange={(event) => setUserCategory(event.target.value)}
                    {...controlProps}
                  >
                    <option value={ALL_CATEGORIES}>All categories</option>
                    <option value={STATUS_ACTIVE}>Active</option>
                    <option value={STATUS_INACTIVE}>Inactive</option>
                    <option value={FAVORITE_CATEGORY}>Favorites</option>
                  </select>
                )}
              </Field>
            </div>

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

            <div className="split-layout">
              <TrendTable
                title="Users created over time"
                trend={userReport.createdOverTime}
              />
              <BreakdownTable
                title="Users by status"
                rows={userReport.statusBreakdown}
              />
            </div>
          </section>

          <section className="section">
            <div className="section__header">
              <h2>Patient Reports</h2>
              <Field label="Patient category">
                {(controlProps) => (
                  <select
                    className="field-control"
                    value={patientCategory}
                    onChange={(event) => setPatientCategory(event.target.value)}
                    {...controlProps}
                  >
                    <option value={ALL_CATEGORIES}>All categories</option>
                    <option value={STATUS_ACTIVE}>Active</option>
                    <option value={STATUS_DISCHARGED}>Discharged</option>
                    <option value={STATUS_PENDING}>Pending</option>
                  </select>
                )}
              </Field>
            </div>

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

            <div className="split-layout">
              <TrendTable
                title="Patients registered over time"
                trend={patientReport.createdOverTime}
              />
              <div>
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
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export { Reports };
