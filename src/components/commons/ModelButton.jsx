import React from 'react';
import "../../assets/css/modelbutton.css";

function ModelButton({text,  onClick }) {
  return (
    <button className="btn btn-success m-1 p-2 modelButton"  onClick={onClick}>{text}</button>
  )
}

export default ModelButton