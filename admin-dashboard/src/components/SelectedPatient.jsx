import { calculateAge } from "../utils/patients";

function SelectedPatient({
  patient: {
    name,
    gender,
    phone,
    email,
    status,
    dateOfBirth,
    lastVisit,
    createdAt,
  },
}) {
  const age = calculateAge(dateOfBirth);

  return (
    <div className="selected-user">
      <h2>Selected Patient</h2>
      <p>Name: {name}</p>
      <p>Email: {email}</p>
      <p>Phone: {phone}</p>
      <p>Age: {age === null ? "—" : age}</p>
      <p>Gender: {gender}</p>
      <p>Status: {status}</p>
      <p>Date of Birth: {dateOfBirth || "—"}</p>
      <p>Last Visit: {lastVisit || "—"}</p>
      <p>Created At: {createdAt ? createdAt.slice(0, 10) : "—"}</p>
    </div>
  );
}

export { SelectedPatient };
