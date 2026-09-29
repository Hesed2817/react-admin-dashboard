import { Avatar } from "./Avatar";
import { StatusBadge } from "./StatusBadge";

// The body of the "view" dialog. This used to be an inline panel below the
// table; it is now only ever rendered inside the shared <Modal>, so it draws no
// card and no shadow of its own — the dialog supplies both. The record name is
// an h3 because the dialog's own title is the h2 directly above it.
function SelectedUser({ user: { name, email, role, status, isFavorite } }) {
  return (
    <div className="detail-panel">
      <div className="detail-panel__header">
        <Avatar name={name} />
        <h3>{name}</h3>
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
    </div>
  );
}

export { SelectedUser };
