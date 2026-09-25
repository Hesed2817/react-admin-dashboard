import { Header } from "../components/Header";
import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { ActivityProvider } from "../context/ActivityProvider";
import { SettingsProvider } from "../context/SettingsProvider";
import { UsersProvider } from "../context/UsersProvider";
import { PatientsProvider } from "../context/PatientsProvider";

function AdminLayout(){
    return(
        <ActivityProvider>
            <SettingsProvider>
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
            </SettingsProvider>
        </ActivityProvider>
    );
}

export {AdminLayout};
