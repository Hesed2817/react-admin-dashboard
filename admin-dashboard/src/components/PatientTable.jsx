import { Button } from "./Button";
import { Icon } from "./Icon";
import { StatusBadge } from "./StatusBadge";
import { TableScroll, SortableTh, Th } from "./Table";
import { useTableSort } from "../hooks/useTableSort";
import { calculateAge } from "../utils/patients";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone", sortValue: (p) => p.phone },
  {
    key: "age",
    label: "Age",
    sortValue: (patient) => calculateAge(patient.dateOfBirth),
  },
  { key: "gender", label: "Gender" },
  { key: "status", label: "Status" },
];

function PatientTable({
  patients,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}) {
  const { sortedRows, toggleSort, getAriaSort } = useTableSort(
    patients,
    COLUMNS,
    "name",
  );

  return (
    <TableScroll label="Patients table">
      <table className="data-table data-table--stack">
        <caption>
          {patients.length} {patients.length === 1 ? "patient" : "patients"},
          sorted by column
        </caption>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <SortableTh
                key={column.key}
                columnKey={column.key}
                label={column.label}
                getAriaSort={getAriaSort}
                onToggle={toggleSort}
              />
            ))}
            <Th label="Actions" />
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((patient) => {
            const age = calculateAge(patient.dateOfBirth);

            return (
              <tr key={patient.id}>
                <td data-label="Name">{patient.name}</td>
                <td data-label="Email" className="cell-muted">
                  {patient.email}
                </td>
                <td data-label="Phone" className="cell-muted">
                  {patient.phone}
                </td>
                <td data-label="Age" className="cell-numeric">
                  {age === null ? "—" : age}
                </td>
                <td data-label="Gender">{patient.gender}</td>
                <td data-label="Status">
                  <StatusBadge status={patient.status} />
                </td>
                <td data-label="Actions">
                  <div className="table-actions">
                    <Button
                      size="sm"
                      className="btn-row-action"
                      onClick={() => onViewPatient(patient.id)}
                      aria-label={`View ${patient.name}`}
                    >
                      <Icon name="view" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="btn-row-action"
                      onClick={() => onEditPatient(patient.id)}
                      aria-label={`Edit ${patient.name}`}
                    >
                      <Icon name="edit" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="btn-row-action btn-row-action--danger"
                      onClick={() => onDeletePatient(patient.id)}
                      aria-label={`Delete ${patient.name}`}
                    >
                      <Icon name="trash" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableScroll>
  );
}

export { PatientTable };
