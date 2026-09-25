import { createStorage } from "./resourceStorage";

const STORAGE_KEY = "admin-dashboard.patients";

function isValidPatient(patient) {
  return (
    patient !== null &&
    typeof patient === "object" &&
    (typeof patient.id === "number" || typeof patient.id === "string") &&
    typeof patient.name === "string" &&
    typeof patient.age === "number" &&
    typeof patient.gender === "string" &&
    typeof patient.phone === "string" &&
    typeof patient.email === "string" &&
    typeof patient.status === "string" &&
    typeof patient.dateOfBirth === "string" &&
    typeof patient.lastVisit === "string" &&
    typeof patient.createdAt === "string"
  );
}

const { getStoredItems: getStoredPatients, saveItems: savePatients } =
  createStorage(STORAGE_KEY, isValidPatient);

export { getStoredPatients, savePatients };
