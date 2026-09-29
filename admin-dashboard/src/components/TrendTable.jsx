import { TableScroll } from "./Table";

function TrendTable({ title, trend }) {
  return (
    <div>
      <h3>{title}</h3>
      {trend.length === 0 ? (
        <p className="field-hint">No registrations for the selected filters.</p>
      ) : (
        <TableScroll label={`${title} table`}>
          <table className="data-table">
            <caption>
              {trend.length} {trend.length === 1 ? "month" : "months"} of
              registrations
            </caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col" className="cell-numeric">
                  New
                </th>
              </tr>
            </thead>
            <tbody>
              {trend.map(({ month, label, value }) => (
                <tr key={month}>
                  <td>{label}</td>
                  <td className="cell-numeric">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      )}
    </div>
  );
}

export { TrendTable };
