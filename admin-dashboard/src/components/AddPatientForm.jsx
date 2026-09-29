import { useState } from "react";
import { validatePatient } from "../utils/patients";
import { PATIENT_STATUS_OPTIONS, STATUS_PENDING } from "../constants/statuses";
import { GENDER_OPTIONS } from "../constants/genders";

function AddPatientForm({ onAddPatient }) {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(STATUS_PENDING);
  const [errors, setErrors] = useState({});

  function handleChange(setValue, field) {
    return (event) => {
      setValue(event.target.value);
      setErrors((previousErrors) => ({
        ...previousErrors,
        [field]: undefined,
      }));
    };
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const values = {
      name: name.trim(),
      dateOfBirth,
      gender,
      phone: phone.trim(),
      email: email.trim(),
      status,
    };

    const nextErrors = validatePatient(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAddPatient({
      ...values,
      lastVisit: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={handleChange(setName, "name")}
      />
      {errors.name && <p>{errors.name}</p>}

      <input
        type="date"
        placeholder="Date of birth"
        value={dateOfBirth}
        onChange={handleChange(setDateOfBirth, "dateOfBirth")}
      />
      {errors.dateOfBirth && <p>{errors.dateOfBirth}</p>}

      <select value={gender} onChange={handleChange(setGender, "gender")}>
        <option value="">Select gender</option>
        {GENDER_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors.gender && <p>{errors.gender}</p>}

      <input
        type="tel"
        placeholder="Phone"
        value={phone}
        onChange={handleChange(setPhone, "phone")}
      />
      {errors.phone && <p>{errors.phone}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={handleChange(setEmail, "email")}
      />
      {errors.email && <p>{errors.email}</p>}

      <select value={status} onChange={handleChange(setStatus, "status")}>
        {PATIENT_STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors.status && <p>{errors.status}</p>}

      <button type="submit">Add Patient</button>
    </form>
  );
}

export { AddPatientForm };
