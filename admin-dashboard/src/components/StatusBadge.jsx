function StatusBadge({ status }) {
  const className =
    status === "Active"
      ? "status-badge status-active"
      : "status-badge status-inactive";

  return <span className={className}>{status}</span>;
}

export { StatusBadge };