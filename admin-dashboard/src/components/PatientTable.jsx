import { Button } from "./Button";
import { Icon } from "./Icon";
import { RowActionsMenu } from "./RowActionsMenu";
import { StatusBadge } from "./StatusBadge";
import { TableScroll, SortableTh, Th } from "./Table";
import { useIsCompactViewport } from "../hooks/useMediaQuery";
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

  // See UserTable: conditional render off the shared 767px query, with the
  // action descriptors built once per row so both views share handlers.
  const isCompact = useIsCompactViewport();

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

            const actions = [
              {
                key: "view",
                label: "View",
                icon: "view",
                ariaLabel: `View ${patient.name}`,
                onSelect: () => onViewPatient(patient.id),
              },
              {
                key: "edit",
                label: "Edit",
                icon: "edit",
                ariaLabel: `Edit ${patient.name}`,
                onSelect: () => onEditPatient(patient.id),
              },
              {
                key: "delete",
                label: "Delete",
                icon: "trash",
                danger: true,
                ariaLabel: `Delete ${patient.name}`,
                onSelect: () => onDeletePatient(patient.id),
              },
            ];

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
                  {isCompact ? (
                    <RowActionsMenu label={patient.name} items={actions} />
                  ) : (
                    <div className="table-actions">
                      {actions.map((action) => (
                        <Button
                          key={action.key}
                          size="sm"
                          className={`btn-row-action${action.danger ? " btn-row-action--danger" : ""}`}
                          onClick={action.onSelect}
                          aria-label={action.ariaLabel}
                        >
                          <Icon name={action.icon} />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
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
