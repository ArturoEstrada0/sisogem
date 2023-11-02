import React, { useState, useContext, useEffect } from "react";
import { AccountContext } from "./Account";

const Status = () => {
  const [status, setStatus] = useState(false);
  const { getSession, logout } = useContext(AccountContext);

  useEffect(() => {
    getSession()
      .then((session) => {
        console.log("Session ", session);
        setStatus(true);
      })
      .catch((error) => {
        console.error("Error in getSession:", error);
      });
  }, []);

  return (
    <div style={{ fontSize: "24px" }}>
      {" "}
      {status ? <button onClick={logout}>logout</button> : "Pleace Login"}
    </div>
  );
};

export default Status;
