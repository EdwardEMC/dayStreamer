import React from "react";
import DashChat from "../../components/Dashboard/DashChat";

function Chat(props) {
  return (
    <DashChat socket={props.socket} online={props.online}/>
  );
};

export default Chat;