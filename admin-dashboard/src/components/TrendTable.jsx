import { TableScroll } from "./Table";
import { toBarPercent } from "../utils/reports";

// Registrations per month.
//
// `showBar` adds a proportional bar column, sized relative to the largest
// value in THIS trend — the same rule BreakdownTable already uses, reusing the
// same helper, so the two never drift. The bar is decorative and hidden from
// assistive tech; the Count column above it is always the real number and is
// never removed, so the bar is a second read of the data, not the only one.
function TrendTable({ title, trend, showBar = false }) {
  const max = trend.reduce((highest, month) => Math.max(highest, month.value), 0);

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
                {showBar && (
                  <th scope="col">
                    <span className="sr-only">Relative size</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {trend.map(({ month, label, value }) => (
                <tr key={month}>
                  <td>{label}</td>
                  <td className="cell-numeric">{value}</td>
                  {showBar && (
                    <td>
                      <span className="breakdown-bar" aria-hidden="true">
                        <span
                          className="breakdown-bar-fill"
                          style={{ width: `${toBarPercent(value, max)}%` }}
                        />
                      </span>
                    </td>
                  )}
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
