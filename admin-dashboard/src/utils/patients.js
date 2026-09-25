const DATE_OF_BIRTH_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isValidDateOfBirth(dateOfBirth) {
  if (typeof dateOfBirth !== "string") {
    return false;
  }

  const parts = DATE_OF_BIRTH_PATTERN.exec(dateOfBirth);

  if (!parts) {
    return false;
  }

  const [, year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function calculateAge(dateOfBirth, referenceDate = new Date()) {
  const parts =
    typeof dateOfBirth === "string" ? DATE_OF_BIRTH_PATTERN.exec(dateOfBirth) : null;

  if (!parts) {
    return null;
  }

  const [, year, month, day] = parts.map(Number);

  let age = referenceDate.getFullYear() - year;
  const monthDifference = referenceDate.getMonth() - (month - 1);

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && referenceDate.getDate() < day)
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export { calculateAge, isValidDateOfBirth };
