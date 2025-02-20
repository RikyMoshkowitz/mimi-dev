import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import Messages from "./components/Messages/Messages";
import Clients from "./components/Clients/Clients";
import Tasks from "./components/Tasks/Tasks";
import Files from "./components/Files/Files";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/dashboard";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/mainPage" element={<MainPage />}>
        <Route path="messages" element={<Messages />} />
        <Route path="clients" element={<Clients />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="files" element={<Files />} />
        <Route path="dashboard" element={<Dashboard />} />
        
      </Route>
      <Route path="register" element={<Register />} />

    </Routes>
  </Router>
);

export default App;
