function BreakdownTable({ title, rows, emptyMessage = "No data yet." }) {
  const hasData = rows.length > 0;

  return (
    <div>
      <h3>{title}</h3>
      {!hasData ? (
        <p>{emptyMessage}</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Count</th>
              <th>Share</th>
              <th>Relative</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{row.count}</td>
                <td>{row.share}%</td>
                <td>
                  <span className="breakdown-bar" aria-hidden="true">
                    <span
                      className="breakdown-bar-fill"
                      style={{ width: `${row.bar}%` }}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export { BreakdownTable };
