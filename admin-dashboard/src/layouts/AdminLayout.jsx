import { Header } from "../components/Header";
import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";

function AdminLayout(){
    return(
        <div className="admin-layout">
            <Header/>
            <Sidebar/>
            <main className="main-content">
                <Outlet/>
            </main>
        </div>
    );
}

export {AdminLayout};