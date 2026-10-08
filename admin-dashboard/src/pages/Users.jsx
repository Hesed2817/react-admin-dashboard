import { useState } from "react";
import { AddUserForm } from "../components/AddUserForm";
import { Button } from "../components/Button";
import { EditUserForm } from "../components/EditUserForm";
import { EmptyState } from "../components/EmptyState";
import { Field } from "../components/Field";
import { Icon } from "../components/Icon";
import { Modal } from "../components/Modal";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { SelectedUser } from "../components/SelectedUser";
import { UserTable } from "../components/UserTable";
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
    setEditingUser(users.find((user) => user.id === id));
  }

  function handleSaveUser(updatedUser) {
    updateUser(updatedUser);
    setEditingUser(null);
  }

  function handleDeleteUser(id) {
    setUserToDelete(users.find((user) => user.id === id));
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
      <PageHeader
        title="Users"
        description="Manage and view registered users"
      >
        <PageActions label="User filters and search">
          <Field label="Status">
            {(controlProps) => (
              <select
                className="field-control"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                {...controlProps}
              >
                <option value={ALL_STATUSES}>All statuses</option>
                {USER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field label="Favorites">
            {(controlProps) => (
              <select
                className="field-control"
                value={favoriteFilter}
                onChange={(event) => setFavoriteFilter(event.target.value)}
                {...controlProps}
              >
                <option value={ALL_STATUSES}>All</option>
                <option value={FAVORITES_FILTER}>Favorites</option>
                <option value={NON_FAVORITES_FILTER}>Non-favorites</option>
              </select>
            )}
          </Field>

          <Field label="Search users" className="search-field">
            {(controlProps) => (
              <>
                <Icon name="search" />
                <input
                  type="text"
                  className="field-control"
                  placeholder="Name, email or role"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  {...controlProps}
                />
              </>
            )}
          </Field>

          <div className="page-actions__primary">
            <Button variant="primary" onClick={handleAddUserModal}>
              <Icon name="plus" />
              Add User
            </Button>
          </div>
        </PageActions>
      </PageHeader>

      {isAddUserModalOpen && (
        <Modal title="Add user" onClose={() => setIsAddUserModalOpen(false)}>
          <AddUserForm onAddUser={handleAddUser} />
        </Modal>
      )}

      {isDeleteModalOpen && userToDelete && (
        <Modal
          title="Delete user"
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          confirmLabel="Delete user"
          confirmVariant="danger"
        >
          <p>
            Are you sure you want to delete <strong>{userToDelete.name}</strong>?
            This permanently removes the record and cannot be undone.
          </p>
        </Modal>
      )}

      {editingUser && (
        <Modal title="Edit user" onClose={() => setEditingUser(null)}>
          <EditUserForm
            key={editingUser.id}
            onSave={handleSaveUser}
            user={editingUser}
          />
        </Modal>
      )}

      {loading ? (
        <div className="loading" role="status" aria-live="polite">
          <span>Loading users...</span>
          <span className="loading__bar" />
        </div>
      ) : error ? (
        <p className="inline-message inline-message--error" role="alert">
          {error}
        </p>
      ) : users.length === 0 ? (
        <EmptyState
          title="No users yet"
          message="Add your first user to get started."
          icon="plus"
        >
          <Button variant="primary" onClick={handleAddUserModal}>
            <Icon name="plus" />
            Add User
          </Button>
        </EmptyState>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No matches"
          message="No users match the current search and filters."
          icon="search"
        />
      ) : (
        <UserTable
          users={filteredUsers}
          onViewUser={handleViewUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onToggleFavorite={handleToggleFavorites}
        />
      )}

      {selectedUser && (
        <Modal title="User details" onClose={() => setSelectedUserId(null)}>
          <SelectedUser user={selectedUser} />
        </Modal>
      )}
    </div>
  );
}

export { Users };
