import { Button } from "./Button";
import { Icon } from "./Icon";
import { RowActionsMenu } from "./RowActionsMenu";
import { StatusBadge } from "./StatusBadge";
import { TableScroll, SortableTh, Th } from "./Table";
import { useIsCompactViewport } from "../hooks/useMediaQuery";
import { useTableSort } from "../hooks/useTableSort";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  {
    key: "status",
    label: "Status",
    // Sort by the status the badge renders, not by class name.
    sortValue: (user) => user.status,
  },
  {
    key: "isFavorite",
    label: "Favorite",
    sortValue: (user) => (user.isFavorite ? 1 : 0),
  },
];

function UserTable({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onToggleFavorite,
}) {
  const { sortedRows, toggleSort, getAriaSort } = useTableSort(
    users,
    COLUMNS,
    "name",
  );

  // Conditional render, not CSS hiding: only one of the two sets of controls is
  // ever in the DOM, so there are no duplicate handlers, no duplicate
  // aria-labels and no hidden tab stops to reason about. The hook reads the
  // same "(max-width: 767px)" query the CSS uses, so JS and CSS cannot drift.
  const isCompact = useIsCompactViewport();

  return (
    <TableScroll label="Users table">
      <table className="data-table data-table--stack">
        <caption>
          {users.length} {users.length === 1 ? "user" : "users"}, sorted by
          column
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
          {sortedRows.map((user) => {
            // Built once per row and rendered twice below, so the mobile menu
            // and the desktop buttons call the identical handlers. ariaLabel is
            // separate from label because the desktop buttons' accessible names
            // are long sentences and must not change.
            const actions = [
              {
                key: "view",
                label: "View",
                icon: "view",
                ariaLabel: `View ${user.name}`,
                onSelect: () => onViewUser(user.id),
              },
              {
                key: "favorite",
                label: user.isFavorite ? "Favorited" : "Favorite",
                icon: user.isFavorite ? "starFilled" : "star",
                ariaLabel: user.isFavorite
                  ? `Remove ${user.name} from favorites`
                  : `Add ${user.name} to favorites`,
                pressed: user.isFavorite === true,
                onSelect: () => onToggleFavorite(user.id),
              },
              {
                key: "edit",
                label: "Edit",
                icon: "edit",
                ariaLabel: `Edit ${user.name}`,
                onSelect: () => onEditUser(user.id),
              },
              {
                key: "delete",
                label: "Delete",
                icon: "trash",
                danger: true,
                ariaLabel: `Delete ${user.name}`,
                onSelect: () => onDeleteUser(user.id),
              },
            ];

            return (
              <tr key={user.id}>
                <td data-label="Name">{user.name}</td>
                <td data-label="Email" className="cell-muted">
                  {user.email}
                </td>
                <td data-label="Role">{user.role}</td>
                <td data-label="Status">
                  <StatusBadge status={user.status} />
                </td>
                <td data-label="Favorite" className="cell-muted">
                  {user.isFavorite ? "Yes" : "No"}
                </td>
                <td data-label="Actions">
                  {isCompact ? (
                    <RowActionsMenu label={user.name} items={actions} />
                  ) : (
                    <div className="table-actions">
                      {actions.map((action) => (
                        <Button
                          key={action.key}
                          size="sm"
                          className={`btn-row-action${action.danger ? " btn-row-action--danger" : ""}`}
                          onClick={action.onSelect}
                          aria-label={action.ariaLabel}
                          aria-pressed={action.pressed}
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

export { UserTable };
