function TrendTable({ title, trend }) {
  return (
    <div>
      <h3>{title}</h3>
      {trend.length === 0 ? (
        <p>No registrations for the selected filters.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>New</th>
            </tr>
          </thead>
          <tbody>
            {trend.map(({ month, label, value }) => (
              <tr key={month}>
                <td>{label}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export { TrendTable };
