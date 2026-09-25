import { createStorage } from "./resourceStorage";

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

const { getStoredItems: getStoredUsers, saveItems: saveUsers } = createStorage(
  STORAGE_KEY,
  isValidUser,
);

export { getStoredUsers, saveUsers };
