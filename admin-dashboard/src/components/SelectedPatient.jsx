import { Avatar } from "./Avatar";
import { StatusBadge } from "./StatusBadge";
import { calculateAge } from "../utils/patients";

// The body of the "view" dialog. This used to be an inline panel below the
// table; it is now only ever rendered inside the shared <Modal>, so it draws no
// card and no shadow of its own — the dialog supplies both. The record name is
// an h3 because the dialog's own title is the h2 directly above it.
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
          <dt>Phone</dt>
          <dd>{phone || "—"}</dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>{age === null ? "—" : age}</dd>
        </div>
        <div>
          <dt>Gender</dt>
          <dd>{gender || "—"}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <StatusBadge status={status} />
          </dd>
        </div>
        <div>
          <dt>Date of birth</dt>
          <dd>{dateOfBirth || "—"}</dd>
        </div>
        <div>
          <dt>Last visit</dt>
          <dd>{lastVisit || "—"}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{createdAt ? createdAt.slice(0, 10) : "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

export { SelectedPatient };
