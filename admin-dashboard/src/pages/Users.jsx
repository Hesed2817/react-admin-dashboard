import { AddUserForm } from "../components/AddUserForm";
import { EditUserForm } from "../components/EditUserForm";
import { Modal } from "../components/Modal";
import { SelectedUser } from "../components/SelectedUser";
import { UserTable } from "../components/UserTable";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PageActions } from "../components/PageActions";
import { useUsers } from "../hooks/useUsers";
function Users() {
  const { users, loading, error, addUser, updateUser, deleteUser, toggleFavorite } =
    useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [favoriteFilter, setFavoriteFilter] = useState("All");
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
      statusFilter === "All" || user.status === statusFilter;
    const favoriteMatches =
      favoriteFilter === "All" ? true :
      favoriteFilter === "Favorites" ? user.isFavorite === true : user.isFavorite === false;
    
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
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>            
          </select>

          <select name="filter-favs" id="favorites" value={favoriteFilter}
            onChange={(event) => setFavoriteFilter(event.target.value)}>
            <option value="All">All</option>
            <option value="Favorites">Favorites</option>
            <option value="Non-favorites">Non-favorites</option>
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
