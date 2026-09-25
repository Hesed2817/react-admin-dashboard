import { Header } from "../components/Header";
import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { UsersProvider } from "../context/UsersProvider";

function AdminLayout(){
    return(
        <UsersProvider>
            <div className="admin-layout">
                <Header/>
                <Sidebar/>
                <main className="main-content">
                    <Outlet/>
                </main>
            </div>
        </UsersProvider>
    );
}

export {AdminLayout};