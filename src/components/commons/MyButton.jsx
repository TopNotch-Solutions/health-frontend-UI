import React from 'react';
import '../../assets/css/myButton.css';

function MyButton({text}) {
  return (
    <button className="btn btn-success p-2 p-xl-3 myButton">
                      {text}
    </button>
  )
}

export default MyButton