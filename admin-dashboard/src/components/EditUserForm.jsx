import { useState } from "react";
import { USER_STATUS_OPTIONS } from "../constants/statuses";

function EditUserForm({ user, onSave }) {
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [editedRole, setEditedRole] = useState(user.role);
  const [editedStatus, setEditedStatus] = useState(user.status);

  function handleSaveUser(event) {
    event.preventDefault();
    const updatedUser = {
      ...user,
      name: editedName.trim(),
      email: editedEmail.trim(),
      role: editedRole.trim(),
      status: editedStatus,
    };
    onSave(updatedUser);
  }

  return (
    <form
      className="edit-user-form"
      onSubmit={(event) => handleSaveUser(event)}
    >
      <input
        type="text"
        required
        value={editedName}        
        onChange={(event) => setEditedName(event.target.value)}
      />
      <input
        type="email"
        required
        value={editedEmail}
        onChange={(event) => setEditedEmail(event.target.value)}
      />
      <input
        type="text"
        required
        value={editedRole}
        onChange={(event) => setEditedRole(event.target.value)}
      />
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
