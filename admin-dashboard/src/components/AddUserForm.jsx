import { useState } from "react";
import { Button } from "./Button";
import { Field } from "./Field";
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
    <form className="form" onSubmit={handleSubmit} noValidate>
      <Field label="Name" error={errors.name}>
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

      <Field label="Role" error={errors.role}>
        {(controlProps) => (
          <input
            type="text"
            className="field-control"
            placeholder="e.g. Administrator, Receptionist"
            value={role}
            onChange={handleChange(setRole, "role")}
            {...controlProps}
          />
        )}
      </Field>

      <div className="form-actions">
        <Button type="submit" variant="primary">
          Add User
        </Button>
      </div>
    </form>
  );
}

export { AddUserForm };
