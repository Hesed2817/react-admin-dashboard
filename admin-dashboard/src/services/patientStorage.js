import { createStorage } from "./resourceStorage";
import { isValidDateOfBirth } from "../utils/patients";

const STORAGE_KEY = "admin-dashboard.patients";

function isValidPatient(patient) {
  return (
    patient !== null &&
    typeof patient === "object" &&
    (typeof patient.id === "number" || typeof patient.id === "string") &&
    typeof patient.name === "string" &&
    typeof patient.gender === "string" &&
    typeof patient.phone === "string" &&
    typeof patient.email === "string" &&
    typeof patient.status === "string" &&
    isValidDateOfBirth(patient.dateOfBirth) &&
    typeof patient.lastVisit === "string" &&
    typeof patient.createdAt === "string" &&
    patient.age === undefined
  );
}

const patientMigrations = {
  0: (patients) =>
    patients.map((patient) => {
      const migratedPatient = { ...patient };
      delete migratedPatient.age;
      return migratedPatient;
    }),
};

const { getStoredItems: getStoredPatients, saveItems: savePatients } =
  createStorage(STORAGE_KEY, isValidPatient, patientMigrations);

export { getStoredPatients, savePatients };
