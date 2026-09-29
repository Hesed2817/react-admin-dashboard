import { isValidEmail, isValidPhone } from "./validation";
import { ALL_STATUSES } from "../constants/statuses";

const DATE_OF_BIRTH_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_PATIENT_AGE = 120;

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

function validatePatient(values) {
  const errors = {};
  const name = values.name.trim();
  const dateOfBirth = values.dateOfBirth;
  const gender = values.gender;
  const phone = values.phone.trim();
  const email = values.email.trim();
  const status = values.status;

  if (!name) {
    errors.name = "Name is required";
  }

  if (!dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
  } else if (!isValidDateOfBirth(dateOfBirth)) {
    errors.dateOfBirth = "Enter a valid date of birth";
  } else if (new Date(dateOfBirth) > new Date()) {
    errors.dateOfBirth = "Date of birth cannot be in the future";
  } else {
    const age = calculateAge(dateOfBirth);

    if (age !== null && age > MAX_PATIENT_AGE) {
      errors.dateOfBirth = `Date of birth implies an age over ${MAX_PATIENT_AGE}`;
    }
  }

  if (!gender) {
    errors.gender = "Gender is required";
  }

  if (!phone) {
    errors.phone = "Phone is required";
  } else if (!isValidPhone(phone)) {
    errors.phone = "Enter a valid phone number";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!status) {
    errors.status = "Status is required";
  }

  return errors;
}

function filterPatients(
  patients,
  { searchTerm = "", statusFilter = ALL_STATUSES } = {},
) {
  const search = searchTerm.trim().toLowerCase();

  return patients.filter((patient) => {
    const matchesSearch =
      search === "" ||
      patient.name.toLowerCase().includes(search) ||
      patient.email.toLowerCase().includes(search) ||
      patient.phone.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === ALL_STATUSES || patient.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}

export { calculateAge, isValidDateOfBirth, validatePatient, filterPatients, MAX_PATIENT_AGE };
