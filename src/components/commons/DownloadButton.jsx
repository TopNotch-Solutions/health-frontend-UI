// ViewButton.jsx
import React from "react";
import { Button } from "@mui/material";
import { IconButton, useTheme, useMediaQuery } from "@mui/material";
import { IoCloudDownloadOutline } from "react-icons/io5";

const DownloadButton = ({ onClick,data }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Button
      variant="contained"
      onClick={onClick}
      style={{
        backgroundColor: "rgba(21, 78, 138, 1)",
        color: "#fff",
        padding: "6px",
        paddingLeft: "10px",
        borderRadius: "5px",
        fontFamily:"Montserrat, sans-serif",
        cursor: "pointer",
        width: isSmallScreen ? "45%" : "16%",
      }}
    >
      Download
      <IoCloudDownloadOutline size={14} style={{ marginLeft: "10px" }} />
    </Button>
  );
};

export default DownloadButton;