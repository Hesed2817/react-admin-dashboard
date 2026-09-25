import { useState } from "react";
import { isValidEmail, isValidPhone } from "../utils/validation";
import { isValidDateOfBirth } from "../utils/patients";
import { PATIENT_STATUS_OPTIONS } from "../constants/statuses";

function EditPatientForm({ patient, onSave }) {
  const [editedName, setEditedName] = useState(patient.name);
  const [editedDateOfBirth, setEditedDateOfBirth] = useState(patient.dateOfBirth);
  const [editedGender, setEditedGender] = useState(patient.gender);
  const [editedPhone, setEditedPhone] = useState(patient.phone);
  const [editedEmail, setEditedEmail] = useState(patient.email);
  const [editedStatus, setEditedStatus] = useState(patient.status);
  const [errors, setErrors] = useState({});

  function validate(values) {
    const nextErrors = {};

    if (!values.name) {
      nextErrors.name = "Name is required";
    }

    if (!values.dateOfBirth) {
      nextErrors.dateOfBirth = "Date of birth is required";
    } else if (!isValidDateOfBirth(values.dateOfBirth)) {
      nextErrors.dateOfBirth = "Enter a valid date of birth";
    } else if (new Date(values.dateOfBirth) > new Date()) {
      nextErrors.dateOfBirth = "Date of birth cannot be in the future";
    }

    if (!values.gender) {
      nextErrors.gender = "Gender is required";
    }

    if (!values.phone) {
      nextErrors.phone = "Phone is required";
    } else if (!isValidPhone(values.phone)) {
      nextErrors.phone = "Enter a valid phone number";
    }

    if (!values.email) {
      nextErrors.email = "Email is required";
    } else if (!isValidEmail(values.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    return nextErrors;
  }

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

    const nextErrors = validate(values);

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
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
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
