import { TableScroll } from "./Table";

function BreakdownTable({ title, rows, emptyMessage = "No data yet." }) {
  const hasData = rows.length > 0;

  return (
    <div>
      <h3>{title}</h3>
      {!hasData ? (
        <p className="field-hint">{emptyMessage}</p>
      ) : (
        <TableScroll label={`${title} table`}>
          <table className="data-table">
            <caption>
              {rows.length} {rows.length === 1 ? "group" : "groups"} in{" "}
              {title.toLowerCase()}
            </caption>
            <thead>
              <tr>
                <th scope="col">Group</th>
                <th scope="col" className="cell-numeric">
                  Count
                </th>
                <th scope="col" className="cell-numeric">
                  Share
                </th>
                <th scope="col">
                  <span className="sr-only">Relative size</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td className="cell-numeric">{row.count}</td>
                  <td className="cell-numeric">{row.share}%</td>
                  <td>
                    {/* Decorative: relative to the largest row, not the
                        total. The Share column above is the real number. */}
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
        </TableScroll>
      )}
    </div>
  );
}

export { BreakdownTable };
