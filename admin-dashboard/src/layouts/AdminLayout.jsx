import { Header } from "../components/Header";
import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { UsersProvider } from "../context/UsersProvider";
import { PatientsProvider } from "../context/PatientsProvider";

function AdminLayout(){
    return(
        <UsersProvider>
            <PatientsProvider>
                <div className="admin-layout">
                    <Header/>
                    <Sidebar/>
                    <main className="main-content">
                        <Outlet/>
                    </main>
                </div>
            </PatientsProvider>
        </UsersProvider>
    );
}

export {AdminLayout};