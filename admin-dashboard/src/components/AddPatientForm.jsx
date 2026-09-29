import { useState } from "react";
import { Button } from "./Button";
import { Field } from "./Field";
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
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <Field label="Name" error={errors.name} className="field--full">
          {(controlProps) => (
            <input
              type="text"
              className="field-control"
              value={name}
              onChange={handleChange(setName, "name")}
              {...controlProps}
            />
          )}
        </Field>

        <Field label="Date of birth" error={errors.dateOfBirth}>
          {(controlProps) => (
            <input
              type="date"
              className="field-control"
              value={dateOfBirth}
              onChange={handleChange(setDateOfBirth, "dateOfBirth")}
              {...controlProps}
            />
          )}
        </Field>

        <Field label="Gender" error={errors.gender}>
          {(controlProps) => (
            <select
              className="field-control"
              value={gender}
              onChange={handleChange(setGender, "gender")}
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
              value={phone}
              onChange={handleChange(setPhone, "phone")}
              {...controlProps}
            />
          )}
        </Field>

        <Field label="Email" error={errors.email}>
          {(controlProps) => (
            <input
              type="email"
              className="field-control"
              value={email}
              onChange={handleChange(setEmail, "email")}
              {...controlProps}
            />
          )}
        </Field>

        <Field label="Status" error={errors.status} className="field--full">
          {(controlProps) => (
            <select
              className="field-control"
              value={status}
              onChange={handleChange(setStatus, "status")}
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
          Add Patient
        </Button>
      </div>
    </form>
  );
}

export { AddPatientForm };
