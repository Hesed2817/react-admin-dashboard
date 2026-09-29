import { useCallback, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { ActivityProvider } from "../context/ActivityProvider";
import { SettingsProvider } from "../context/SettingsProvider";
import { UsersProvider } from "../context/UsersProvider";
import { PatientsProvider } from "../context/PatientsProvider";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useIsCompactViewport } from "../hooks/useMediaQuery";

function AdminLayout() {
  // The user's intent ("I opened the menu"), kept separate from whether the
  // drawer is actually available at the current width.
  const [isDrawerRequestedOpen, setIsDrawerRequestedOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

  // Subscribes to the breakpoint, so resizing or rotating updates it live.
  const isCompact = useIsCompactViewport();

  // Derived, not synchronised with an effect: widening past the breakpoint
  // closes the drawer implicitly, with no cascading render, and the focus
  // trap disengages because its `isActive` flag goes false.
  const isDrawerOpen = isDrawerRequestedOpen && isCompact;

  const closeDrawer = useCallback(() => setIsDrawerRequestedOpen(false), []);

  // Traps Tab, closes on Escape and restores focus to the menu button.
  useFocusTrap(sidebarRef, isDrawerOpen, closeDrawer);

  function handleNavigate() {
    setIsDrawerRequestedOpen(false);
  }

  return (
    <ActivityProvider>
      <SettingsProvider>
        <UsersProvider>
          <PatientsProvider>
            <div className="admin-layout">
              <Header
                isMenuOpen={isDrawerOpen}
                onToggleMenu={() => setIsDrawerRequestedOpen((open) => !open)}
              />
              <Sidebar
                ref={sidebarRef}
                isOpen={isDrawerOpen}
                isCompact={isCompact}
                onNavigate={handleNavigate}
              />
              {isDrawerOpen && isCompact && (
                <button
                  type="button"
                  className="sidebar-scrim"
                  aria-label="Close navigation"
                  onClick={closeDrawer}
                />
              )}
              <main className="main-content">
                {/* Keyed on the path so each route gets one enter transition
                    instead of every card animating on every parent render. */}
                <div className="page" key={location.pathname}>
                  <Outlet />
                </div>
              </main>
            </div>
          </PatientsProvider>
        </UsersProvider>
      </SettingsProvider>
    </ActivityProvider>
  );
}

export { AdminLayout };
