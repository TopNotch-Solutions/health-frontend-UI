// ViewButton.jsx
import React from "react";
import { Button } from "@mui/material";
import { IconButton, useTheme, useMediaQuery } from "@mui/material";
import { IoArrowBackSharp } from "react-icons/io5";
const BackButton = ({ onClick }) => {
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
        width: isSmallScreen ? "30%" : "13%",
      }}
    >
       <IoArrowBackSharp size={14} style={{ marginRight: "10px" }} />

      Back
         </Button>
  );
};

export default BackButton;