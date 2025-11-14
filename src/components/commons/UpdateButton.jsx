// ViewButton.jsx
import React from "react";
import { Button } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { MdDelete } from "react-icons/md";
const UpdateButton = ({ onClick }) => {
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
        cursor: "pointer",
        marginRight: "10px",
        fontFamily:"Montserrat, sans-serif",
        width: isSmallScreen ? "40%" : "40%",
      }}
    >
      Update
    </Button>
  );
};

export default UpdateButton;