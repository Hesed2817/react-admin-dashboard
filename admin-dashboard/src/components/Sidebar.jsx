import { NavLink } from "react-router";
function Sidebar() {
    return (
        <nav className="sidebar">
            <ul>
                <li><NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/">Dashboard</NavLink></li>
                <li><NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/users">Users</NavLink></li>
                <li><NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/patients">Patients</NavLink></li>
                <li><NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/reports">Reports</NavLink></li>
                <li><NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/settings">Settings</NavLink></li>
            </ul>
        </nav>
    );
}

export { Sidebar };