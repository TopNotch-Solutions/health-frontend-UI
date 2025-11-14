// ViewButton.jsx
import React from "react";
import { Button } from "@mui/material";
import { FaEye} from "react-icons/fa";

const ViewButton = ({ onClick }) => {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      style={{
        backgroundColor: "rgba(0, 149, 72, 1)",
        color: "#fff",
        padding: "6px",
        paddingLeft: "10px",
        borderRadius: "5px",
        cursor: "pointer",
        fontFamily:"Montserrat, sans-serif",
        width: "50%",
      }}
    >
      View
      <FaEye size={14} style={{ marginLeft: "10px" }} />
    </Button>
  );
};

export default ViewButton;



// BenefitVoucher