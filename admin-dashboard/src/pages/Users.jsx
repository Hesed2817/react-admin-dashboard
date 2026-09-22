import { AddUserForm } from "../components/AddUserForm";
import { EditUserForm } from "../components/EditUserForm";
import { SelectedUser } from "../components/SelectedUser";
import { UserTable } from "../components/UserTable";
import { useState } from "react";
function Users() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Banda",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Mary Phiri",
      email: "mary@example.com",
      role: "Doctor",
      status: "Active",
    },
    {
      id: 3,
      name: "Peter Mbewe",
      email: "peter@example.com",
      role: "Receptionist",
      status: "Inactive",
    },
  ]);

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search)
    );
  });
  function handleViewUser(id) {
    const user = users.find((user) => user.id === id);

    setSelectedUser(user);
  }

  function handleAddUser(newUser) {
    const userWithId = {
      ...newUser,
      id: users.length + 1,
    };

    setUsers((previousUsers) => [...previousUsers, userWithId]);
  }

  function handleEditUser(id) {
    const editingUser = users.find((user) => user.id === id);
    setEditingUser(editingUser);
  }

  function handleSaveUser(updatedUser) {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user,
      ),
    );
    setEditingUser(null);
  }

  function handleDeleteUser(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete the user?",
    );

    if (confirmed) {
      setUsers((prevUsers) => prevUsers.filter((user)=>user.id !== id));
    } else return;
  }

  return (
    <div>
      <h1>Users</h1>
      <AddUserForm onAddUser={handleAddUser} />

      {editingUser && (
        <EditUserForm onSave={handleSaveUser} user={editingUser} />
      )}
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <UserTable
          users={filteredUsers}
          onViewUser={handleViewUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />
      )}
      {selectedUser && <SelectedUser user={selectedUser} />}
    </div>
  );
}

export { Users };
