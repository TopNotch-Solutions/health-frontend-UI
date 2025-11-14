// ViewButton.jsx
import React from "react";
import { Button } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { MdDelete } from "react-icons/md";
const DeleteButton = ({ onClick }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Button
      variant="contained"
      onClick={onClick}
      style={{
        backgroundColor: "rgba(210, 31, 53, 1)",
        color: "#fff",
        padding: "6px",
        paddingLeft: "10px",
        borderRadius: "5px",
        cursor: "pointer",
        fontFamily:"Montserrat, sans-serif",
        marginRight: "10px",
        width: isSmallScreen ? "40%" : "40%",
      }}
    >
      Delete
      
    </Button>
  );
};

export default DeleteButton;