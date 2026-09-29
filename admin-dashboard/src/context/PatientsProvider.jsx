import { useState, useEffect } from "react";
import { getPatients } from "../services/patientService";
import {
  getStoredPatients,
  savePatients,
} from "../services/patientStorage";
import { nextId } from "../utils/ids";
import { PatientsContext } from "./PatientsContext";
import { useActivities } from "../hooks/useActivities";

function PatientsProvider({ children }) {
  const { recordActivity } = useActivities();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function loadPatients() {
      try {
        const storedPatients = getStoredPatients();

        if (storedPatients) {
          setPatients(storedPatients);
          return;
        }

        setPatients(await getPatients());
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
        setIsHydrated(true);
      }
    }

    loadPatients();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      savePatients(patients);
    }
  }, [isHydrated, patients]);

  function addPatient(newPatient) {
    const patientWithId = {
      ...newPatient,
      id: nextId(patients),
      createdAt: new Date().toISOString(),
    };

    setPatients((previousPatients) => [...previousPatients, patientWithId]);
    recordActivity({
      type: "created",
      message: `Patient "${patientWithId.name}" created`,
      entityType: "patient",
      entityId: patientWithId.id,
    });
  }

  function updatePatient(updatedPatient) {
    setPatients((previousPatients) =>
      previousPatients.map((patient) =>
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

    if (!deletedPatient) {
      return;
    }

    setPatients((previousPatients) =>
      previousPatients.filter((patient) => patient.id !== id),
    );
    recordActivity({
      type: "deleted",
      message: `Patient "${deletedPatient.name}" deleted`,
      entityType: "patient",
      entityId: deletedPatient.id,
    });
  }

  async function resetPatients() {
    setPatients(await getPatients());
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
        resetPatients,
      }}
    >
      {children}
    </PatientsContext.Provider>
  );
}

export { PatientsProvider };
