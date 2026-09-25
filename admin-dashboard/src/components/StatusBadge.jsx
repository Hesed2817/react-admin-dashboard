import {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_PENDING,
} from "../constants/statuses";

function StatusBadge({ status }) {
  const statusClassNames = {
    [STATUS_ACTIVE]: "status-badge status-active",
    [STATUS_INACTIVE]: "status-badge status-inactive",
    [STATUS_PENDING]: "status-badge status-pending",
  };

  const className =
    statusClassNames[status] || "status-badge status-inactive";

  return <span className={className}>{status}</span>;
}

export { StatusBadge };
