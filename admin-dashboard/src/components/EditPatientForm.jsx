import { useState } from "react";
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
    <form className="edit-user-form" onSubmit={handleSavePatient} noValidate>
      <input
        type="text"
        value={editedName}
        onChange={(event) => setEditedName(event.target.value)}
      />
      {errors.name && <p>{errors.name}</p>}

      <input
        type="date"
        value={editedDateOfBirth}
        onChange={(event) => setEditedDateOfBirth(event.target.value)}
      />
      {errors.dateOfBirth && <p>{errors.dateOfBirth}</p>}

      <select
        value={editedGender}
        onChange={(event) => setEditedGender(event.target.value)}
      >
        {GENDER_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors.gender && <p>{errors.gender}</p>}

      <input
        type="tel"
        value={editedPhone}
        onChange={(event) => setEditedPhone(event.target.value)}
      />
      {errors.phone && <p>{errors.phone}</p>}

      <input
        type="email"
        value={editedEmail}
        onChange={(event) => setEditedEmail(event.target.value)}
      />
      {errors.email && <p>{errors.email}</p>}

      <select
        value={editedStatus}
        onChange={(event) => setEditedStatus(event.target.value)}
      >
        {PATIENT_STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <button type="submit">Save Changes</button>
    </form>
  );
}

export { EditPatientForm };
