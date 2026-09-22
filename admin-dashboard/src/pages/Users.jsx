import { AddUserForm } from "../components/AddUserForm";
import { EditUserForm } from "../components/EditUserForm";
import { Modal } from "../components/Modal";
import { SelectedUser } from "../components/SelectedUser";
import { UserTable } from "../components/UserTable";
import { useState, useEffect } from "react";
import { getUsers } from "../services/userService";
function Users() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteUser, setDeleteUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [users, setUsers] = useState([]);

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
    const user = users.find((user) => user.id === id);
    setDeleteUser(user);
    setIsDeleteModalOpen(true);
  }

  function handleConfirmDelete() {
    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.id !== deleteUser.id),
    );
    setIsDeleteModalOpen(false);
  }

  function handleCancelDelete() {
    setDeleteUser(null);
    setIsDeleteModalOpen(false);
  }
  useEffect(() => {
    async function loadUsers() {
      try {
        const loadedUsers = await getUsers();
        setUsers(loadedUsers);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <AddUserForm onAddUser={handleAddUser} />
      {isDeleteModalOpen && (
        <Modal onClose={handleCancelDelete} onConfirm={handleConfirmDelete}>
          <h3>Delete User</h3>
          <p>Are you sure you want to delete {deleteUser.name}?</p>
        </Modal>
      )}

      {editingUser && (
        <EditUserForm onSave={handleSaveUser} user={editingUser} />
      )}
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export { Users };
