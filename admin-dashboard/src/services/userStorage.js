const STORAGE_KEY = "admin-dashboard.users";

function isValidUser(user) {
  return (
    user !== null &&
    typeof user === "object" &&
    (typeof user.id === "number" || typeof user.id === "string") &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string" &&
    typeof user.status === "string" &&
    typeof user.isFavorite === "boolean"
  );
}

function getStoredUsers() {
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEY);

    if (!rawUsers) {
      return null;
    }

    const parsedUsers = JSON.parse(rawUsers);

    if (!Array.isArray(parsedUsers) || !parsedUsers.every(isValidUser)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsedUsers;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    return;
  }
}

export { getStoredUsers, saveUsers };
