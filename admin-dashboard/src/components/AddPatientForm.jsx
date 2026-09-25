import { useState } from "react";
import { isValidEmail, isValidPhone } from "../utils/validation";

function AddPatientForm({ onAddPatient }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Pending");
  const [errors, setErrors] = useState({});

  function validate(values) {
    const nextErrors = {};

    if (!values.name) {
      nextErrors.name = "Name is required";
    }

    if (!values.age) {
      nextErrors.age = "Age is required";
    } else if (
      !Number.isFinite(Number(values.age)) ||
      Number(values.age) < 0 ||
      Number(values.age) > 120
    ) {
      nextErrors.age = "Enter an age between 0 and 120";
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
      age: Number(age),
      gender,
      phone: phone.trim(),
      email: email.trim(),
      status,
    };

    const nextErrors = validate({ ...values, age });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAddPatient({
      ...values,
      dateOfBirth: "",
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
        type="number"
        placeholder="Age"
        value={age}
        onChange={handleChange(setAge, "age")}
      />
      {errors.age && <p>{errors.age}</p>}

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
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Pending">Pending</option>
      </select>
      {errors.status && <p>{errors.status}</p>}

      <button type="submit">Add Patient</button>
    </form>
  );
}

export { AddPatientForm };
