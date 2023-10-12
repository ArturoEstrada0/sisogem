import React from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Dashboard />
      </div>
    </Router>
  );
}

export default App;
