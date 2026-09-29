import { useState, useEffect } from "react";
import { getUsers, deriveUserCreatedAt } from "../services/userService";
import { getStoredUsers, saveUsers } from "../services/userStorage";
import { nextId } from "../utils/ids";
import { useActivities } from "../hooks/useActivities";
import { UsersContext } from "./UsersContext";

function UsersProvider({ children }) {
  const { recordActivity } = useActivities();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        const storedUsers = getStoredUsers();

        if (storedUsers) {
          setUsers(
            storedUsers.map((user) =>
              user.createdAt
                ? user
                : { ...user, createdAt: deriveUserCreatedAt(user.id) },
            ),
          );
          return;
        }

        setUsers(await getUsers());
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
        setIsHydrated(true);
      }
    }

    loadUsers();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveUsers(users);
    }
  }, [isHydrated, users]);

  function addUser(newUser) {
    const userWithId = {
      ...newUser,
      id: nextId(users),
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    setUsers((previousUsers) => [...previousUsers, userWithId]);
    recordActivity({
      type: "created",
      message: `User "${userWithId.name}" created`,
      entityType: "user",
      entityId: userWithId.id,
    });
  }

  function updateUser(updatedUser) {
    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
      ),
    );
    recordActivity({
      type: "updated",
      message: `User "${updatedUser.name}" updated`,
      entityType: "user",
      entityId: updatedUser.id,
    });
  }

  function deleteUser(id) {
    const deletedUser = users.find((user) => user.id === id);

    if (!deletedUser) {
      return;
    }

    setUsers((previousUsers) =>
      previousUsers.filter((user) => user.id !== id),
    );
    recordActivity({
      type: "deleted",
      message: `User "${deletedUser.name}" deleted`,
      entityType: "user",
      entityId: deletedUser.id,
    });
  }

  function toggleFavorite(id) {
    const toggledUser = users.find((user) => user.id === id);

    if (!toggledUser) {
      return;
    }

    const isNowFavorite = !toggledUser.isFavorite;

    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === id ? { ...user, isFavorite: isNowFavorite } : user,
      ),
    );
    recordActivity({
      type: isNowFavorite ? "favorited" : "unfavorited",
      message: `User "${toggledUser.name}" ${
        isNowFavorite ? "favorited" : "unfavorited"
      }`,
      entityType: "user",
      entityId: toggledUser.id,
    });
  }

  async function resetUsers() {
    setUsers(await getUsers());
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
        resetUsers,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export { UsersProvider };
