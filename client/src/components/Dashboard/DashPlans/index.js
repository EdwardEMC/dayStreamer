import React from "react";
import "./style.css";

const loadingPath = process.env.PUBLIC_URL + '/assets/LoadingIcons/';

function DashPlans() {
  return (
    <div className="text-center">
      <h1>DashPlans</h1>
      <h5><img id="loading" src={loadingPath + "loading.gif"} alt="loading gif"></img>&emsp;Under Construction</h5>
    </div>
  );
};

export default DashPlans;