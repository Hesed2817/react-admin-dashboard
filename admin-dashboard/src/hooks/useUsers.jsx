import { useState, useEffect } from "react";
import { getUsers } from "../services/userService";

function useUsers (){
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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

  return ({
    users,
    error,
    loading,
    setUsers
  });
}

export {useUsers};