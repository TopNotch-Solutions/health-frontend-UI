import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import AdminLogin from "./pages/AdminLogin";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Topbar from "./components/admin/TopBar";
import Sidebar from "./components/admin/SideBar";
import Dashboard from "./pages/Dashboard";
import Bso from "./pages/Bso";
import Content from "./pages/Content";
import Msme from "./pages/Msme";
import User from "./pages/User";
import Notifications from "./pages/Notifications";
import Reporting from "./pages/Reporting";
import Profile from "./pages/Profile";
import Specialization from "./pages/Specialization";
import FAQ from "./pages/FAQ";
import Ailment from "./pages/Ailment";
import { useSelector } from "react-redux";
import AdminRoute from "./AdminRoute";
import SubmitEmail from "./pages/SubmitEmail";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };
  let sidebar = useSelector((state) => state.sidebar.isSidebarOpen);
  let currentUser = useSelector((state) => state.auth.user);
  const isAuthenticated = currentUser ? true: false;

  return (
    <Router>
      <ToastContainer />
      <div className="App">
        <div className="content">
          <div className="d-flex" style={{ display: "flex", height: "100vh" }}>
            {sidebar && (
              <Sidebar
                openSidebarToggle={openSidebarToggle}
                OpenSidebar={OpenSidebar}
              />
            )}
            <div
              style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                borderBottom: "1px solid rgba(255, 255, 255, 1)",
              }}
            >
              <div>{sidebar && <Topbar OpenSidebar={OpenSidebar} />}</div>
              <div
                style={{ flexGrow: 1, overflow: "auto" }}
              >
                <Routes>
                  <Route path="/" element={<AdminLogin />} />
                  <Route element={<AdminRoute />}>
                    <Route path="/Dashboard" element={<Dashboard />} />
                    <Route path="/Bso" element={<Bso />} />
                    <Route path="/Users" element={<User />} />
                    <Route path="/Content" element={<Content />} />
                    <Route path="/Msme" element={<Msme />} />
                    <Route path="/Specialization" element={<Specialization />} />
                    <Route path="/Aliment" element={<Ailment />} />
                    <Route path="/FAQ" element={<FAQ />} />
                    <Route path="/Notifications" element={<Notifications />} />
                    <Route path="/Profile" element={<Profile />} />
                    <Route path="/Reporting" element={<Reporting />} />
                  </Route>
                  <Route path="/submit" element={<SubmitEmail />} />
                  <Route path="/reset-password" element={<ForgotPassword />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
