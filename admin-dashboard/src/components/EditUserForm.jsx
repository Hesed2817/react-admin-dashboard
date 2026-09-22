import { useState, useEffect } from "react";

function EditUserForm({ user, onSave }) {
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedRole, setEditedRole] = useState("");

  useEffect(() => {
    setEditedName(user.name);
    setEditedRole(user.role);
    setEditedEmail(user.email);
  }, [user]);

  function handleSaveUser(event) {
    event.preventDefault();
    const updatedUser = {
      ...user,
      name: editedName,
      email: editedEmail,
      role: editedRole,
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
      <button type="submit">Save Changes</button>
    </form>
  );
}

export { EditUserForm };
