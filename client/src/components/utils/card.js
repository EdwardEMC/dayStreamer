import React from "react";
import "./style.css";

function Card(props) {
  return (
    <div className="container">
      <div className="card">
        <h2 className="text-center card-header custom-head-color">
          {props.title}
        </h2>
        <div className="card-body">
          {props.insert}
        </div>
      </div>
    </div>
  );
};

export default Card;