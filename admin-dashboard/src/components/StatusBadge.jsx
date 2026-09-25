function StatusBadge({ status }) {
  const statusClassNames = {
    Active: "status-badge status-active",
    Inactive: "status-badge status-inactive",
    Pending: "status-badge status-pending",
  };

  const className =
    statusClassNames[status] || "status-badge status-inactive";

  return <span className={className}>{status}</span>;
}

export { StatusBadge };
