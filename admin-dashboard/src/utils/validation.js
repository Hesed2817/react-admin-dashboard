const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value) {
  return EMAIL_PATTERN.test(value);
}

function isValidPhone(value) {
  return (
    /^[+]?[\d\s()-]{7,20}$/.test(value) &&
    value.replace(/\D/g, "").length >= 7
  );
}

export { isValidEmail, isValidPhone };
