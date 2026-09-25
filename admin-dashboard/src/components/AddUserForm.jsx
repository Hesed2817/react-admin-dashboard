import { useState } from "react";
import { isValidEmail } from "../utils/validation";

function AddUserForm({ onAddUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});

  function validate(values) {
    const nextErrors = {};

    if (!values.name) {
      nextErrors.name = "Name is required";
    }

    if (!values.email) {
      nextErrors.email = "Email is required";
    } else if (!isValidEmail(values.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!values.role) {
      nextErrors.role = "Role is required";
    }

    return nextErrors;
  }

  function handleChange(setValue, field) {
    return (event) => {
      setValue(event.target.value);
      setErrors((previousErrors) => ({ ...previousErrors, [field]: undefined }));
    };
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const values = {
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
    };

    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAddUser({ ...values, status: "Active" });
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
        type="email"
        placeholder="Email"
        value={email}
        onChange={handleChange(setEmail, "email")}
      />
      {errors.email && <p>{errors.email}</p>}

      <input
        type="text"
        placeholder="Role"
        value={role}
        onChange={handleChange(setRole, "role")}
      />
      {errors.role && <p>{errors.role}</p>}

      <button type="submit">
        Add User
      </button>
    </form>
  );
}

export { AddUserForm };
