import { useState, useEffect } from "react";
import { getPatients } from "../services/patientService";
import {
  getStoredPatients,
  savePatients,
} from "../services/patientStorage";
import { PatientsContext } from "./PatientsContext";

function PatientsProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      try {
        const storedPatients = getStoredPatients();

        if (storedPatients) {
          setPatients(storedPatients);
          return;
        }

        const loadedPatients = await getPatients();
        setPatients(loadedPatients);
        savePatients(loadedPatients);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);

  function commitPatients(nextPatients) {
    setPatients(nextPatients);
    savePatients(nextPatients);
  }

  function addPatient(newPatient) {
    const nextId =
      patients.reduce(
        (maxId, patient) => Math.max(maxId, Number(patient.id) || 0),
        0,
      ) + 1;

    const patientWithId = {
      ...newPatient,
      id: nextId,
      createdAt: new Date().toISOString(),
    };

    commitPatients([...patients, patientWithId]);
  }

  function updatePatient(updatedPatient) {
    commitPatients(
      patients.map((patient) =>
        patient.id === updatedPatient.id
          ? { ...patient, ...updatedPatient }
          : patient,
      ),
    );
  }

  function deletePatient(id) {
    commitPatients(patients.filter((patient) => patient.id !== id));
  }

  return (
    <PatientsContext.Provider
      value={{
        patients,
        error,
        loading,
        addPatient,
        updatePatient,
        deletePatient,
      }}
    >
      {children}
    </PatientsContext.Provider>
  );
}

export { PatientsProvider };
