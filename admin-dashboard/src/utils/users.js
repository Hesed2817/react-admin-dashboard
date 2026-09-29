import { isValidEmail } from "./validation";
import { ALL_STATUSES, FAVORITES_FILTER } from "../constants/statuses";

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function findDuplicateEmail(users, email, excludeId) {
  const targetEmail = normalizeEmail(email);

  return (
    users.find(
      (user) =>
        user.id !== excludeId && normalizeEmail(user.email) === targetEmail,
    ) || null
  );
}

function validateUser(values, { users = [], excludeId } = {}) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const role = values.role.trim();

  if (!name) {
    errors.name = "Name is required";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address";
  } else {
    const duplicateUser = findDuplicateEmail(users, email, excludeId);

    if (duplicateUser) {
      errors.email = `This email is already used by "${duplicateUser.name}"`;
    }
  }

  if (!role) {
    errors.role = "Role is required";
  }

  return errors;
}

function filterUsers(
  users,
  {
    searchTerm = "",
    statusFilter = ALL_STATUSES,
    favoriteFilter = ALL_STATUSES,
  } = {},
) {
  const search = searchTerm.trim().toLowerCase();

  return users.filter((user) => {
    const matchesSearch =
      search === "" ||
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === ALL_STATUSES || user.status === statusFilter;

    const matchesFavorite =
      favoriteFilter === ALL_STATUSES
        ? true
        : favoriteFilter === FAVORITES_FILTER
          ? user.isFavorite === true
          : user.isFavorite === false;

    return matchesSearch && matchesStatus && matchesFavorite;
  });
}

export {
  normalizeEmail,
  findDuplicateEmail,
  validateUser,
  filterUsers,
};
