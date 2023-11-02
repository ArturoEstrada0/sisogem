import React from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header";

import { Account } from "./components/Account";
import SignUp from "./components/SignUp";
import Login2 from "./components/Login";
import Status from "./components/Status";
import Settings from "./components/Settings";

function App() {
  return (
    <Router>
      <div>
        <Header />
        {/* <Dashboard /> */}
        <Account>
          <Status />
          <SignUp />
          <Login2 />
          <Settings />
        </Account>
      </div>
    </Router>
  );
}

export default App;
