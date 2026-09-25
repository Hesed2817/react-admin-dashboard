import { useState } from "react";
import { isValidEmail, isValidPhone } from "../utils/validation";
import { isValidDateOfBirth } from "../utils/patients";
import { PATIENT_STATUS_OPTIONS, STATUS_PENDING } from "../constants/statuses";

function AddPatientForm({ onAddPatient }) {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(STATUS_PENDING);
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

    if (!values.status) {
      nextErrors.status = "Status is required";
    }

    return nextErrors;
  }

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

    const nextErrors = validate(values);

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
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
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
