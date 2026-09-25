import { AddUserForm } from "../components/AddUserForm";
import { EditUserForm } from "../components/EditUserForm";
import { Modal } from "../components/Modal";
import { SelectedUser } from "../components/SelectedUser";
import { UserTable } from "../components/UserTable";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PageActions } from "../components/PageActions";
import { useUsers } from "../hooks/useUsers";
import { USER_STATUS_OPTIONS } from "../constants/statuses";

const ALL_STATUSES = "All";
const FAVORITES_FILTER = "Favorites";
const NON_FAVORITES_FILTER = "Non-favorites";

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

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.trim().toLowerCase();
    const matches =
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search);
    const statusMatches =
      statusFilter === ALL_STATUSES || user.status === statusFilter;
    const favoriteMatches =
      favoriteFilter === ALL_STATUSES
        ? true
        : favoriteFilter === FAVORITES_FILTER
          ? user.isFavorite === true
          : user.isFavorite === false;
    
    return matches && statusMatches && favoriteMatches ;
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
          {filteredUsers.length === 0 ? (
            <p>No users found.</p>
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
