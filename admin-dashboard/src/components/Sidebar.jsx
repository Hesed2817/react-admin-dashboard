import { forwardRef } from "react";
import { NavLink } from "react-router";
import { MediaPlaceholder } from "./MediaPlaceholder";
import { useSettings } from "../hooks/useSettings";

// Font Awesome Free (solid) class names. Solid only, so the app loads one
// webfont. Each icon is decorative and sits beside a real text label, so it
// is aria-hidden and never carries meaning on its own.
const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "fa-gauge-high" },
  { to: "/users", label: "Users", icon: "fa-users" },
  { to: "/patients", label: "Patients", icon: "fa-user-doctor" },
  { to: "/reports", label: "Reports", icon: "fa-chart-column" },
  { to: "/activity", label: "Activity", icon: "fa-clock-rotate-left" },
  { to: "/settings", label: "Settings", icon: "fa-gear" },
];

// Two groups, because there IS a real split here: the five pages you work in
// versus the single page that configures the app. Settings is the only
// secondary item, so it is its own labelled group rather than being padded
// out with invented siblings.
const WORKSPACE_ITEMS = NAV_ITEMS.filter((item) => item.to !== "/settings");
const SECONDARY_ITEMS = NAV_ITEMS.filter((item) => item.to === "/settings");

const NAV_GROUPS = [
  { key: "workspace", label: "Workspace", items: WORKSPACE_ITEMS },
  { key: "secondary", label: "Preferences", items: SECONDARY_ITEMS },
];

// The sidebar sits inside SettingsProvider in AdminLayout, so this reads the
// same profile the Settings page edits. Nothing here is invented: the empty
// state is shown as an empty state, not filled in with a placeholder person.
function useProfileCard() {
  const { settings } = useSettings();
  const name = settings.profile.name.trim();
  const role = settings.profile.role.trim();

  return {
    name: name || "Profile not set",
    role: role || "Set your details in Settings",
    isEmpty: !name && !role,
  };
}

const Sidebar = forwardRef(function Sidebar(
  { isOpen = false, onNavigate },
  ref,
) {
  const profile = useProfileCard();

  return (
    <nav
      ref={ref}
      id="app-sidebar"
      className={isOpen ? "sidebar is-open" : "sidebar"}
      tabIndex={-1}
      aria-label="Main navigation"
    >
      <div className="nav-groups">
        {NAV_GROUPS.map((group) => (
          <div className="nav-group" key={group.key}>
            <p className="nav-group__label">{group.label}</p>
            <ul>
              {group.items.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    to={to}
                    end={to === "/"}
                    onClick={onNavigate}
                  >
                    <span className="nav-link__icon" aria-hidden="true">
                      <i className={`fa-solid ${icon}`} />
                    </span>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Real profile data from Settings, and a real destination: the card
          navigates to the page that edits exactly this information. It is not
          a decorative avatar with a dead click target. */}
      <NavLink className="sidebar-profile" to="/settings" onClick={onNavigate}>
        <MediaPlaceholder
          kind="avatar"
          variant="avatar"
          label="Profile photo placeholder"
        />
        <span className="sidebar-profile__text">
          <span className="sidebar-profile__name">{profile.name}</span>
          <span className="sidebar-profile__role">{profile.role}</span>
        </span>
      </NavLink>
    </nav>
  );
});

export { Sidebar };
