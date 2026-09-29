import { forwardRef } from "react";
import { NavLink } from "react-router";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/users", label: "Users" },
  { to: "/patients", label: "Patients" },
  { to: "/reports", label: "Reports" },
  { to: "/activity", label: "Activity" },
  { to: "/settings", label: "Settings" },
];

const Sidebar = forwardRef(function Sidebar(
  { isOpen = false, onNavigate },
  ref,
) {
  return (
    <nav
      ref={ref}
      id="app-sidebar"
      className={isOpen ? "sidebar is-open" : "sidebar"}
      tabIndex={-1}
      aria-label="Main navigation"
    >
      <ul>
        {NAV_ITEMS.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              to={to}
              end={to === "/"}
              onClick={onNavigate}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
});

export { Sidebar };
