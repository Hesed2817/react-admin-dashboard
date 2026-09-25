import { useContext } from "react";
import { PatientsContext } from "../context/PatientsContext";

function usePatients() {
  const context = useContext(PatientsContext);

  if (!context) {
    throw new Error("usePatients must be used within a PatientsProvider");
  }

  return context;
}

export { usePatients };
