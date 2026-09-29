import { useState } from "react";
import { Button } from "./Button";
import { Field } from "./Field";
import { validateUser } from "../utils/users";
import { useUsers } from "../hooks/useUsers";
import { USER_STATUS_OPTIONS } from "../constants/statuses";

function EditUserForm({ user, onSave }) {
  const { users } = useUsers();
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [editedRole, setEditedRole] = useState(user.role);
  const [editedStatus, setEditedStatus] = useState(user.status);
  const [errors, setErrors] = useState({});

  function handleChange(setValue, field) {
    return (event) => {
      setValue(event.target.value);
      setErrors((previousErrors) => ({ ...previousErrors, [field]: undefined }));
    };
  }

  function handleSaveUser(event) {
    event.preventDefault();

    const values = {
      name: editedName.trim(),
      email: editedEmail.trim(),
      role: editedRole.trim(),
      status: editedStatus,
    };

    const nextErrors = validateUser(values, { users, excludeId: user.id });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({ ...user, ...values });
  }

  return (
    <form className="form" onSubmit={handleSaveUser} noValidate>
      <Field label="Name" error={errors.name}>
        {(controlProps) => (
          <input
            type="text"
            className="field-control"
            value={editedName}
            onChange={handleChange(setEditedName, "name")}
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
            onChange={handleChange(setEditedEmail, "email")}
            {...controlProps}
          />
        )}
      </Field>

      <Field label="Role" error={errors.role}>
        {(controlProps) => (
          <input
            type="text"
            className="field-control"
            value={editedRole}
            onChange={handleChange(setEditedRole, "role")}
            {...controlProps}
          />
        )}
      </Field>

      <Field label="Status" error={errors.status}>
        {(controlProps) => (
          <select
            className="field-control"
            value={editedStatus}
            onChange={(event) => setEditedStatus(event.target.value)}
            {...controlProps}
          >
            {USER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        )}
      </Field>

      <div className="form-actions">
        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export { EditUserForm };
