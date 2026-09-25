import { useState, useEffect } from "react";
import { getUsers, deriveUserCreatedAt } from "../services/userService";
import { getStoredUsers, saveUsers } from "../services/userStorage";
import { UsersContext } from "./UsersContext";

function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const storedUsers = getStoredUsers();

        if (storedUsers) {
          const migratedUsers = storedUsers.map((user) =>
            user.createdAt
              ? user
              : { ...user, createdAt: deriveUserCreatedAt(user.id) },
          );
          setUsers(migratedUsers);
          saveUsers(migratedUsers);
          return;
        }

        const loadedUsers = await getUsers();
        setUsers(loadedUsers);
        saveUsers(loadedUsers);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  function commitUsers(nextUsers) {
    setUsers(nextUsers);
    saveUsers(nextUsers);
  }

  function addUser(newUser) {
    const nextId =
      users.reduce((maxId, user) => Math.max(maxId, Number(user.id) || 0), 0) +
      1;

    const userWithId = {
      ...newUser,
      id: nextId,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    commitUsers([...users, userWithId]);
  }

  function updateUser(updatedUser) {
    commitUsers(
      users.map((user) =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
      ),
    );
  }

  function deleteUser(id) {
    commitUsers(users.filter((user) => user.id !== id));
  }

  function toggleFavorite(id) {
    commitUsers(
      users.map((user) =>
        user.id === id ? { ...user, isFavorite: !user.isFavorite } : user,
      ),
    );
  }

  return (
    <UsersContext.Provider
      value={{
        users,
        error,
        loading,
        addUser,
        updateUser,
        deleteUser,
        toggleFavorite,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export { UsersProvider };
