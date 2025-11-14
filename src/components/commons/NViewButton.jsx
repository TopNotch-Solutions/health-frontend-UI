// ViewButton.jsx
import React from "react";
import { Button, useTheme, useMediaQuery } from "@mui/material";

const NViewButton = ({ onClick }) => {
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
        fontFamily:"Montserrat, sans-serif",
        marginRight: "10px",
        width: isSmallScreen ? "40%" : "40%",
      }}
    >
      View
    </Button>
  );
};

export default NViewButton;



// BenefitVoucher