import { useState } from "react";
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
    <form
      className="edit-user-form"
      onSubmit={handleSaveUser}
      noValidate
    >
      <input
        type="text"
        required
        value={editedName}
        onChange={handleChange(setEditedName, "name")}
      />
      {errors.name && <p>{errors.name}</p>}

      <input
        type="email"
        required
        value={editedEmail}
        onChange={handleChange(setEditedEmail, "email")}
      />
      {errors.email && <p>{errors.email}</p>}

      <input
        type="text"
        required
        value={editedRole}
        onChange={handleChange(setEditedRole, "role")}
      />
      {errors.role && <p>{errors.role}</p>}

      <select
        value={editedStatus}
        onChange={(event) => setEditedStatus(event.target.value)}
      >
        {USER_STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button type="submit">Save Changes</button>
    </form>
  );
}

export { EditUserForm };
