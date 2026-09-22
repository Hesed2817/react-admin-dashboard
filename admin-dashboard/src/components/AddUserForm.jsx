import { useState } from "react";

function AddUserForm({ onAddUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const newUser = {
      name,
      email,
      role,
      status: "Active",
    };

    onAddUser(newUser);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        required
        onChange={(event) => setName(event.target.value.trim())}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        required
        onChange={(event) => setEmail(event.target.value.trim())}
      />

      <input
        type="text"
        placeholder="Role"
        value={role}
        required
        onChange={(event) => setRole(event.target.value.trim())}
      />

      <button type="submit">
        Add User
      </button>
    </form>
  );
}

export { AddUserForm };