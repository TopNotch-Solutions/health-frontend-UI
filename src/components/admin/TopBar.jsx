import React, { useEffect, useState } from "react";
import { Box, IconButton, Avatar, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import Dropdown from "react-bootstrap/Dropdown";
import Badge from "@mui/material/Badge";
import { BsPersonGear, BsBoxArrowRight } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/in4logo.png";
import "../../assets/css/TopBar.css";
import { CapitalizeFirstLetter } from "../../utils/capitalizeFirstLetter";
import { toggleSidebarfalse } from "../../redux/reducers/sidebarReducer";
import { login } from "../../redux/reducers/authReducer";
import { toggleAuthenticationfalse } from "../../redux/reducers/twoFactorReducer";
import { toggleActiveTab } from "../../redux/reducers/tabsReducer";
import Swal from "sweetalert2";
import fetchJSON from "../../utils/fetchJSON";

const Topbar = ({ OpenSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [allNotificationsCount, setAllNotificationsCount] = useState(0);

  const fullName = currentUser?.firstName + " " + currentUser?.lastName;
  const firstLetter = CapitalizeFirstLetter(currentUser?.firstName || "");
  const secondLetter = CapitalizeFirstLetter(currentUser?.lastName || "");

  // Fetch real notification count from API
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!currentUser?._id) {
        setAllNotificationsCount(0);
        return;
      }

      try {
        const response = await fetchJSON(
          `http://localhost:4000/api/portal/notification/unread-count/${currentUser._id}`,
          "GET"
        );

        if (response.status === true && response.data) {
          setAllNotificationsCount(response.data.unReadCount || 0);
        } else {
          setAllNotificationsCount(0);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
        setAllNotificationsCount(0);
      }
    };

    fetchNotificationCount();
    
    // Set up polling to refresh notification count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [currentUser?._id]);

  const handleLogout = async () => {
    try {
      dispatch(toggleAuthenticationfalse());
      dispatch(toggleSidebarfalse());
      dispatch(
        login({
          user: {},
        })
      );
      navigate("/");
      Swal.fire({
        title: "Logged Out",
        text: "You have been successfully logged out.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout even if there's an error
      dispatch(toggleAuthenticationfalse());
      dispatch(toggleSidebarfalse());
      dispatch(
        login({
          user: {},
        })
      );
      navigate("/");
    }
  };

  return (
    <Box
      className="topbar-container"
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1.5rem",
        background: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="topbar-left">
        <Box display="flex" alignItems="center" gap={2}>
          <div className="d-none d-lg-block">
            <img src={logo} alt="logo" className="topbar-logo" />
          </div>
          <div className="d-block d-lg-none">
            <IconButton onClick={OpenSidebar} sx={{ color: "#009547" }}>
              <MenuIcon />
            </IconButton>
          </div>
        </Box>
      </div>

      <Box display="flex" alignItems="center" gap={2}>
        <Tooltip title="Notifications">
          <div
            className="notification-icon"
            onClick={() => {
              dispatch(toggleActiveTab({ activeTab: 6 }));
              navigate("/Notifications");
            }}
          >
            <IconButton sx={{ color: "#666" }}>
              {allNotificationsCount > 0 ? (
                <Badge
                  badgeContent={allNotificationsCount}
                  max={99}
                  color="primary"
                >
                  <NotificationsOutlinedIcon />
                </Badge>
              ) : (
                <NotificationsOutlinedIcon />
              )}
            </IconButton>
          </div>
        </Tooltip>

        <div className="user-info d-none d-sm-flex">
          <div className="user-details">
            <p className="user-name">
              {fullName.length <= 14
                ? fullName
                : currentUser?.lastName}
            </p>
            <p className="user-role">{currentUser?.role}</p>
          </div>
        </div>

        <div className="user-avatar">
          <Avatar
            alt="User Profile"
            src={currentUser?.profileImage ? `http://localhost:4000/images/${currentUser.profileImage}` : undefined}
            sx={{
              bgcolor: currentUser?.profileImage ? undefined : "#1976d2",
              width: 40,
              height: 40,
            }}
          >
            {!currentUser?.profileImage && `${firstLetter}${secondLetter}`}
          </Avatar>
        </div>

        <Dropdown className="user-dropdown" autoClose="outside">
          <Dropdown.Toggle
            variant=""
            id="dropdown-basic"
            className="dropdown-toggle"
          ></Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu">
            <Dropdown.Item
              href="/profile"
              onClick={() => dispatch(toggleActiveTab({ activeTab: 8 }))}
              className="dropdown-item"
            >
              <BsPersonGear /> Profile
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogout} className="dropdown-item">
              <BsBoxArrowRight /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Box>
    </Box>
  );
};

export default Topbar;