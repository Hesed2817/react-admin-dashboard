import { useState } from "react";
import { Button } from "./Button";
import { Field } from "./Field";
import { validatePatient } from "../utils/patients";
import { PATIENT_STATUS_OPTIONS } from "../constants/statuses";
import { GENDER_OPTIONS } from "../constants/genders";

function EditPatientForm({ patient, onSave }) {
  const [editedName, setEditedName] = useState(patient.name);
  const [editedDateOfBirth, setEditedDateOfBirth] = useState(patient.dateOfBirth);
  const [editedGender, setEditedGender] = useState(patient.gender);
  const [editedPhone, setEditedPhone] = useState(patient.phone);
  const [editedEmail, setEditedEmail] = useState(patient.email);
  const [editedStatus, setEditedStatus] = useState(patient.status);
  const [errors, setErrors] = useState({});

  function handleSavePatient(event) {
    event.preventDefault();

    const values = {
      name: editedName.trim(),
      dateOfBirth: editedDateOfBirth,
      gender: editedGender,
      phone: editedPhone.trim(),
      email: editedEmail.trim(),
      status: editedStatus,
    };

    const nextErrors = validatePatient(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      ...patient,
      ...values,
    });
  }

  return (
    <form className="form" onSubmit={handleSavePatient} noValidate>
      <div className="form-grid">
        <Field label="Name" error={errors.name} className="field--full">
          {(controlProps) => (
            <input
              type="text"
              className="field-control"
              value={editedName}
              onChange={(event) => setEditedName(event.target.value)}
              {...controlProps}
            />
          )}
        </Field>

        <Field label="Date of birth" error={errors.dateOfBirth}>
          {(controlProps) => (
            <input
              type="date"
              className="field-control"
              value={editedDateOfBirth}
              onChange={(event) => setEditedDateOfBirth(event.target.value)}
              {...controlProps}
            />
          )}
        </Field>

        <Field label="Gender" error={errors.gender}>
          {(controlProps) => (
            <select
              className="field-control"
              value={editedGender}
              onChange={(event) => setEditedGender(event.target.value)}
              {...controlProps}
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Phone" error={errors.phone}>
          {(controlProps) => (
            <input
              type="tel"
              className="field-control"
              value={editedPhone}
              onChange={(event) => setEditedPhone(event.target.value)}
              {...controlProps}
            />
          )}
        </Field>

        <Field label="Email" error={errors.email}>
          {(controlProps) => (
            <input
              type="email"
              className="field-control"
              value={editedEmail}
              onChange={(event) => setEditedEmail(event.target.value)}
              {...controlProps}
            />
          )}
        </Field>

        <Field label="Status" error={errors.status} className="field--full">
          {(controlProps) => (
            <select
              className="field-control"
              value={editedStatus}
              onChange={(event) => setEditedStatus(event.target.value)}
              {...controlProps}
            >
              {PATIENT_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="form-actions">
        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export { EditPatientForm };
