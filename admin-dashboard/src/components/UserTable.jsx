import { Button } from "./Button";
import { Icon } from "./Icon";
import { StatusBadge } from "./StatusBadge";
import { TableScroll, SortableTh, Th } from "./Table";
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
          {sortedRows.map((user) => (
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
                <div className="table-actions">
                  <Button
                    size="sm"
                    className="btn-row-action"
                    onClick={() => onViewUser(user.id)}
                    aria-label={`View ${user.name}`}
                  >
                    <Icon name="view" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="btn-row-action"
                    onClick={() => onToggleFavorite(user.id)}
                    aria-label={
                      user.isFavorite
                        ? `Remove ${user.name} from favorites`
                        : `Add ${user.name} to favorites`
                    }
                    aria-pressed={user.isFavorite === true}
                  >
                    <Icon name={user.isFavorite ? "starFilled" : "star"} />
                    {user.isFavorite ? "Favorited" : "Favorite"}
                  </Button>
                  <Button
                    size="sm"
                    className="btn-row-action"
                    onClick={() => onEditUser(user.id)}
                    aria-label={`Edit ${user.name}`}
                  >
                    <Icon name="edit" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="btn-row-action btn-row-action--danger"
                    onClick={() => onDeleteUser(user.id)}
                    aria-label={`Delete ${user.name}`}
                  >
                    <Icon name="trash" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

export { UserTable };
