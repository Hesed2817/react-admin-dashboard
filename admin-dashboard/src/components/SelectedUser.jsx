import { Avatar } from "./Avatar";
import { StatusBadge } from "./StatusBadge";

function SelectedUser({ user: { name, email, role, status, isFavorite } }) {
  return (
    <section className="detail-panel" aria-label="Selected user">
      <div className="detail-panel__header">
        <Avatar name={name} />
        <h2>{name}</h2>
      </div>

      <dl className="detail-list">
        <div>
          <dt>Email</dt>
          <dd>{email || "—"}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{role || "—"}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <StatusBadge status={status} />
          </dd>
        </div>
        <div>
          <dt>Favorite</dt>
          <dd>{isFavorite ? "Yes" : "No"}</dd>
        </div>
      </dl>
    </section>
  );
}

export { SelectedUser };
