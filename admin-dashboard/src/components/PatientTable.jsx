import { StatusBadge } from "./StatusBadge";

function PatientTable({
  patients,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}) {
  return (
    <table className="user-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {patients.map(
          ({ id, name, email, phone, age, gender, status }) => (
            <tr key={id}>
              <td>{name}</td>
              <td>{email}</td>
              <td>{phone}</td>
              <td>{age}</td>
              <td>{gender}</td>
              <td>
                <StatusBadge status={status} />
              </td>
              <td>
                <button onClick={() => onViewPatient(id)}>View</button>
                <button onClick={() => onEditPatient(id)}>Edit</button>
                <button onClick={() => onDeletePatient(id)}>Delete</button>
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  );
}

export { PatientTable };
