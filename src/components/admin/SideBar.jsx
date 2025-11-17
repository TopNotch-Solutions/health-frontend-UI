import React, { useEffect, useState } from "react";
import {
  Dashboard as DashboardIcon,
  PeopleAlt as PeopleAltIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HealingIcon from "@mui/icons-material/Healing";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HelpIcon from "@mui/icons-material/Help";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import Tooltip from "@mui/material/Tooltip";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleActiveTab } from "../../redux/reducers/tabsReducer";
import "../../assets/css/Sidebar.css";

const menuItems = [
  { id: 1, title: "Dashboard", icon: DashboardIcon, path: "/Dashboard" },
  { id: 2, title: "Registration", icon: AddBusinessIcon, path: "/registration" },
  { id: 3, title: "Request", icon: RequestQuoteIcon, path: "/Request" },
  { id: 4, title: "Specializations", icon: LocalHospitalIcon, path: "/specializations" },
  { id: 5, title: "Ailments", icon: HealingIcon, path: "/ailments" },
  { id: 6, title: "Administrators", icon: PeopleAltIcon, path: "/administrators" },
  { id: 7, title: "Transactions", icon: AccountBalanceWalletIcon, path: "/transactions" },
  { id: 8, title: "Issues", icon: AssignmentIcon, path: "/issues" },
  { id: 9, title: "FAQs", icon: HelpIcon, path: "/FAQ" },
  { id: 10, title: "Notifications", icon: NotificationsIcon, path: "/Notifications" },
  { id: 11, title: "Reporting", icon: PictureAsPdfIcon, path: "/Reporting" },
   { id: 12, title: "Profile", icon: AccountCircleIcon, path: "/Profile" },
];

const Sidebar = ({ openSidebarToggle, OpenSidebar }) => {
  const dispatch = useDispatch();
  const activeSidebarTab = useSelector((state) => state.tabs.activeTab);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);
  const [navList, setNavList] = useState(activeSidebarTab);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setNavList(activeSidebarTab);
  }, [activeSidebarTab]);

  const handleNavLinkClick = (id) => {
    if (!isLargeScreen) {
      OpenSidebar();
    }
    dispatch(toggleActiveTab({ activeTab: id }));
  };

  return (
    <aside
      className={`sidebar-container ${openSidebarToggle ? "sidebar-responsive" : ""}`}
      style={{
        width: "240px"
      }}
    >
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <Tooltip title="NamibRide portal">
            <NavLink
              to="/Dashboard"
              onClick={() => handleNavLinkClick(1)}
              className="brand-link"
            >
              <h4 className="brand-title">HealthConnect</h4>
            </NavLink>
          </Tooltip>
        </div>
        <button className="close-button" onClick={OpenSidebar}>
          <CloseIcon />
        </button>
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`nav-link ${navList === item.id ? "active" : ""}`}
                onClick={() => handleNavLinkClick(item.id)}
              >
                <Icon className="nav-icon" />
                <span className="nav-text">{item.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
