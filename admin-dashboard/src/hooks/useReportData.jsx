import { usePatients } from "./usePatients";
import { useUsers } from "./useUsers";
import { buildPatientReport, buildUserReport } from "../utils/reports";

const IN_PERIOD_DESCRIPTION = "In selected period";

function toStatistic(id, title, value) {
  return { id, title, value, description: IN_PERIOD_DESCRIPTION };
}

function buildUserStatistics(report) {
  return [
    toStatistic("users-total", "Total Users", report.total),
    toStatistic("users-active", "Active Users", report.active),
    toStatistic("users-inactive", "Inactive Users", report.inactive),
    toStatistic("users-favorite", "Favorite Users", report.favorite),
  ];
}

function buildPatientStatistics(report) {
  return [
    toStatistic("patients-total", "Total Patients", report.total),
    toStatistic("patients-active", "Active Patients", report.active),
    toStatistic("patients-discharged", "Discharged Patients", report.discharged),
    toStatistic("patients-pending", "Pending Patients", report.pending),
  ];
}

function useReportData({ period, userCategory, patientCategory }) {
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

  const userReport = buildUserReport(users, {
    period,
    category: userCategory,
  });

  const patientReport = buildPatientReport(patients, {
    period,
    category: patientCategory,
  });

  return {
    loading: usersLoading || patientsLoading,
    error: usersError || patientsError,
    isEmpty: users.length === 0 && patients.length === 0,
    userReport,
    patientReport,
    userStatistics: buildUserStatistics(userReport),
    patientStatistics: buildPatientStatistics(patientReport),
  };
}

export { useReportData };
