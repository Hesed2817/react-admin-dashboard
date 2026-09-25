import { useState, useEffect } from "react";
import { getPatients } from "../services/patientService";
import {
  getStoredPatients,
  savePatients,
} from "../services/patientStorage";
import { PatientsContext } from "./PatientsContext";
import { useActivities } from "../hooks/useActivities";

function PatientsProvider({ children }) {
  const { recordActivity } = useActivities();
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
    recordActivity({
      type: "created",
      message: `Patient "${patientWithId.name}" created`,
      entityType: "patient",
      entityId: patientWithId.id,
    });
  }

  function updatePatient(updatedPatient) {
    commitPatients(
      patients.map((patient) =>
        patient.id === updatedPatient.id
          ? { ...patient, ...updatedPatient }
          : patient,
      ),
    );
    recordActivity({
      type: "updated",
      message: `Patient "${updatedPatient.name}" updated`,
      entityType: "patient",
      entityId: updatedPatient.id,
    });
  }

  function deletePatient(id) {
    const deletedPatient = patients.find((patient) => patient.id === id);

    commitPatients(patients.filter((patient) => patient.id !== id));
    recordActivity({
      type: "deleted",
      message: `Patient "${deletedPatient ? deletedPatient.name : id}" deleted`,
      entityType: "patient",
      entityId: id,
    });
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
