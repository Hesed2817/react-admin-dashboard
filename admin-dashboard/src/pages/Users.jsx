import { AddUserForm } from "../components/AddUserForm";
import { EditUserForm } from "../components/EditUserForm";
import { Modal } from "../components/Modal";
import { SelectedUser } from "../components/SelectedUser";
import { UserTable } from "../components/UserTable";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PageActions } from "../components/PageActions";
import { useUsers } from "../hooks/useUsers";
import {
  ALL_STATUSES,
  FAVORITES_FILTER,
  NON_FAVORITES_FILTER,
  USER_STATUS_OPTIONS,
} from "../constants/statuses";
import { filterUsers } from "../utils/users";

function Users() {
  const { users, loading, error, addUser, updateUser, deleteUser, toggleFavorite } =
    useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [favoriteFilter, setFavoriteFilter] = useState(ALL_STATUSES);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const selectedUser =
    users.find((user) => user.id === selectedUserId) || null;

  const filteredUsers = filterUsers(users, {
    searchTerm,
    statusFilter,
    favoriteFilter,
  });

  function handleViewUser(id) {
    setSelectedUserId(id);
  }

  function handleAddUser(newUser) {
    addUser(newUser);
    setIsAddUserModalOpen(false);
  }

  function handleEditUser(id) {
    const editingUser = users.find((user) => user.id === id);
    setEditingUser(editingUser);
  }

  function handleSaveUser(updatedUser) {
    updateUser(updatedUser);
    setEditingUser(null);
  }

  function handleDeleteUser(id) {
    const user = users.find((user) => user.id === id);
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  }

  function handleConfirmDelete() {
    deleteUser(userToDelete.id);

    if (selectedUserId === userToDelete.id) {
      setSelectedUserId(null);
    }

    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  }

  function handleCancelDelete() {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  }

  function handleAddUserModal() {
    setIsAddUserModalOpen(true);
  }

  function handleToggleFavorites(id) {
    toggleFavorite(id);
  }

  return (
    <div>
      <PageHeader title="Users" description="Manage and view registered users">
        <PageActions>
          <select
            name="filter-options"
            id="filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value={ALL_STATUSES}>All</option>
            {USER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select name="filter-favs" id="favorites" value={favoriteFilter}
            onChange={(event) => setFavoriteFilter(event.target.value)}>
            <option value={ALL_STATUSES}>All</option>
            <option value={FAVORITES_FILTER}>Favorites</option>
            <option value={NON_FAVORITES_FILTER}>Non-favorites</option>
          </select>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="button" onClick={handleAddUserModal}>
            Add User
          </button>
        </PageActions>
      </PageHeader>
      {isAddUserModalOpen && (
        <Modal onClose={() => setIsAddUserModalOpen(false)}>
          <AddUserForm onAddUser={handleAddUser} />
        </Modal>
      )}
      {isDeleteModalOpen && (
        <Modal onClose={handleCancelDelete} onConfirm={handleConfirmDelete}>
          <h3>Delete User</h3>
          <p>Are you sure you want to delete {userToDelete.name}?</p>
        </Modal>
      )}

      {editingUser && (
        <Modal onClose={() => setEditingUser(null)}>
          <EditUserForm
            key={editingUser.id}
            onSave={handleSaveUser}
            user={editingUser}
          />
        </Modal>
      )}
      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          {users.length === 0 ? (
            <p>No users yet. Add your first user to get started.</p>
          ) : filteredUsers.length === 0 ? (
            <p>No users match the current search and filters.</p>
          ) : (
            <UserTable
              users={filteredUsers}
              onViewUser={handleViewUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onToggleFavorite={handleToggleFavorites}
            />
          )}
          {selectedUser && <SelectedUser user={selectedUser} />}
        </>
      )}
    </div>
  );
}

export { Users };
