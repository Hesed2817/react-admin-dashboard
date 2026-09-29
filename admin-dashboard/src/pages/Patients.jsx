import { useState } from "react";
import { AddPatientForm } from "../components/AddPatientForm";
import { Button } from "../components/Button";
import { EditPatientForm } from "../components/EditPatientForm";
import { EmptyState } from "../components/EmptyState";
import { Field } from "../components/Field";
import { Icon } from "../components/Icon";
import { Modal } from "../components/Modal";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { PatientTable } from "../components/PatientTable";
import { SelectedPatient } from "../components/SelectedPatient";
import { usePatients } from "../hooks/usePatients";
import {
  ALL_STATUSES,
  PATIENT_STATUS_OPTIONS,
} from "../constants/statuses";
import { filterPatients } from "../utils/patients";

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

  const filteredPatients = filterPatients(patients, {
    searchTerm,
    statusFilter,
  });

  function handleViewPatient(id) {
    setSelectedPatientId(id);
  }

  function handleAddPatient(newPatient) {
    addPatient(newPatient);
    setIsAddPatientModalOpen(false);
  }

  function handleEditPatient(id) {
    setEditingPatient(patients.find((patient) => patient.id === id));
  }

  function handleSavePatient(updatedPatient) {
    updatePatient(updatedPatient);
    setEditingPatient(null);
  }

  function handleDeletePatient(id) {
    setPatientToDelete(patients.find((patient) => patient.id === id));
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
        <PageActions label="Patient filters and search">
          <Field label="Status">
            {(controlProps) => (
              <select
                className="field-control"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                {...controlProps}
              >
                <option value={ALL_STATUSES}>All statuses</option>
                {PATIENT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field label="Search patients" className="search-field">
            {(controlProps) => (
              <>
                <Icon name="search" />
                <input
                  type="text"
                  className="field-control"
                  placeholder="Name, email or phone"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  {...controlProps}
                />
              </>
            )}
          </Field>

          <div className="page-actions__primary">
            <Button variant="primary" onClick={handleAddPatientModal}>
              <Icon name="plus" />
              Add Patient
            </Button>
          </div>
        </PageActions>
      </PageHeader>

      {isAddPatientModalOpen && (
        <Modal title="Add patient" onClose={() => setIsAddPatientModalOpen(false)}>
          <AddPatientForm onAddPatient={handleAddPatient} />
        </Modal>
      )}

      {isDeleteModalOpen && patientToDelete && (
        <Modal
          title="Delete patient"
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          confirmLabel="Delete patient"
          confirmVariant="danger"
        >
          <p>
            Are you sure you want to delete{" "}
            <strong>{patientToDelete.name}</strong>? This permanently removes the
            record and cannot be undone.
          </p>
        </Modal>
      )}

      {editingPatient && (
        <Modal title="Edit patient" onClose={() => setEditingPatient(null)}>
          <EditPatientForm
            key={editingPatient.id}
            onSave={handleSavePatient}
            patient={editingPatient}
          />
        </Modal>
      )}

      {loading ? (
        <div className="loading" role="status" aria-live="polite">
          <span>Loading patients...</span>
          <span className="loading__bar" />
        </div>
      ) : error ? (
        <p className="inline-message inline-message--error" role="alert">
          {error}
        </p>
      ) : patients.length === 0 ? (
        <EmptyState
          title="No patients yet"
          message="Add your first patient to get started."
          icon="plus"
        >
          <Button variant="primary" onClick={handleAddPatientModal}>
            <Icon name="plus" />
            Add Patient
          </Button>
        </EmptyState>
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          title="No matches"
          message="No patients match the current search and filters."
          icon="search"
        />
      ) : (
        <PatientTable
          patients={filteredPatients}
          onViewPatient={handleViewPatient}
          onEditPatient={handleEditPatient}
          onDeletePatient={handleDeletePatient}
        />
      )}

      {selectedPatient && <SelectedPatient patient={selectedPatient} />}
    </div>
  );
}

export { Patients };
