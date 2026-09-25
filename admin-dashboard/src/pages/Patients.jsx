import { useState } from "react";
import { AddPatientForm } from "../components/AddPatientForm";
import { EditPatientForm } from "../components/EditPatientForm";
import { Modal } from "../components/Modal";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { PatientTable } from "../components/PatientTable";
import { SelectedPatient } from "../components/SelectedPatient";
import { usePatients } from "../hooks/usePatients";
import { PATIENT_STATUS_OPTIONS } from "../constants/statuses";

const ALL_STATUSES = "All";

function Patients() {
  const { patients, loading, error, addPatient, updatePatient, deletePatient } =
    usePatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) || null;

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.trim().toLowerCase();
    const matches =
      patient.name.toLowerCase().includes(search) ||
      patient.email.toLowerCase().includes(search) ||
      patient.phone.toLowerCase().includes(search);
    const statusMatches =
      statusFilter === ALL_STATUSES || patient.status === statusFilter;

    return matches && statusMatches;
  });

  function handleViewPatient(id) {
    setSelectedPatientId(id);
  }

  function handleAddPatient(newPatient) {
    addPatient(newPatient);
    setIsAddPatientModalOpen(false);
  }

  function handleEditPatient(id) {
    const patient = patients.find((patient) => patient.id === id);
    setEditingPatient(patient);
  }

  function handleSavePatient(updatedPatient) {
    updatePatient(updatedPatient);
    setEditingPatient(null);
  }

  function handleDeletePatient(id) {
    const patient = patients.find((patient) => patient.id === id);
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  }

  function handleConfirmDelete() {
    deletePatient(patientToDelete.id);

    if (selectedPatientId === patientToDelete.id) {
      setSelectedPatientId(null);
    }

    setPatientToDelete(null);
    setIsDeleteModalOpen(false);
  }

  function handleCancelDelete() {
    setPatientToDelete(null);
    setIsDeleteModalOpen(false);
  }

  function handleAddPatientModal() {
    setIsAddPatientModalOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Manage and view registered patients"
      >
        <PageActions>
          <select
            name="patient-status-filter"
            id="patient-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value={ALL_STATUSES}>All</option>
            {PATIENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="button" onClick={handleAddPatientModal}>
            Add Patient
          </button>
        </PageActions>
      </PageHeader>

      {isAddPatientModalOpen && (
        <Modal onClose={() => setIsAddPatientModalOpen(false)}>
          <AddPatientForm onAddPatient={handleAddPatient} />
        </Modal>
      )}

      {isDeleteModalOpen && (
        <Modal onClose={handleCancelDelete} onConfirm={handleConfirmDelete}>
          <h3>Delete Patient</h3>
          <p>Are you sure you want to delete {patientToDelete.name}?</p>
        </Modal>
      )}

      {editingPatient && (
        <Modal onClose={() => setEditingPatient(null)}>
          <EditPatientForm
            key={editingPatient.id}
            onSave={handleSavePatient}
            patient={editingPatient}
          />
        </Modal>
      )}

      {loading ? (
        <p>Loading patients...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          {filteredPatients.length === 0 ? (
            <p>No patients found.</p>
          ) : (
            <PatientTable
              patients={filteredPatients}
              onViewPatient={handleViewPatient}
              onEditPatient={handleEditPatient}
              onDeletePatient={handleDeletePatient}
            />
          )}
          {selectedPatient && <SelectedPatient patient={selectedPatient} />}
        </>
      )}
    </div>
  );
}

export { Patients };
