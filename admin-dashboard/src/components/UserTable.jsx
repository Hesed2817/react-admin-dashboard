import { StatusBadge } from "./StatusBadge";

function UserTable({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onToggleFavorite,
}) {
  return (
    <table className="user-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Favorite</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {users.map(({ id, name, email, role, status, isFavorite }) => (
          <tr key={id}>
            <td>{name}</td>
            <td>{email}</td>
            <td>{role}</td>
            <td>
              <StatusBadge status={status} />
            </td>
            <td>{isFavorite ? "Yes" : "No"}</td>
            <td>
              <button onClick={() => onViewUser(id)}>View</button>

              <button onClick={() => onToggleFavorite(id)}>
                {isFavorite ? "★ Favorited" : "☆ Favorite"}
              </button>
              <button onClick={() => onEditUser(id)}>Edit</button>
              <button onClick={() => onDeleteUser(id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { UserTable };
