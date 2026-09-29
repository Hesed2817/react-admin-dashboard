import { useState } from "react";
import { validateUser } from "../utils/users";
import { useUsers } from "../hooks/useUsers";
import { STATUS_ACTIVE } from "../constants/statuses";

function AddUserForm({ onAddUser }) {
  const { users } = useUsers();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});

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

    const nextErrors = validateUser(values, { users });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAddUser({ ...values, status: STATUS_ACTIVE });
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
