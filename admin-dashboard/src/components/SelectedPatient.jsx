import { Avatar } from "./Avatar";
import { StatusBadge } from "./StatusBadge";
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
    <section className="detail-panel" aria-label="Selected patient">
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
    </section>
  );
}

export { SelectedPatient };
