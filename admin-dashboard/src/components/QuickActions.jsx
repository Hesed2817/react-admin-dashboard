import { Link } from "react-router";
import { Icon } from "./Icon";

// A list of real destinations.
//
// This slot is where the reference dashboard puts a to-do list. This app has
// no tasks, no assignments and no due dates, so a list of invented tasks would
// be fiction dressed as data. These are instead the four things an operator
// actually does from this screen, each one a link that really navigates.
function QuickActions({ title, items }) {
  return (
    <section className="card quick-actions">
      <h2 className="quick-actions__title">{title}</h2>
      <ul className="quick-actions__list">
        {items.map(({ to, label, description, icon }) => (
          <li key={to}>
            <Link className="quick-action" to={to}>
              <span className="quick-action__icon" aria-hidden="true">
                <Icon name={icon} />
              </span>
              <span className="quick-action__text">
                <span className="quick-action__label">{label}</span>
                <span className="quick-action__description">{description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { QuickActions };
