import React, { useState } from "react";
import "./Headers.css";
import { DarkMode, LightMode, Notifications } from "@mui/icons-material";
import { Avatar, Badge, IconButton } from "@mui/material";

const Headers = ({ user }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mssgCount, setMssgCount] = useState(1);

  const changeMode = () => {
    setDarkMode(!darkMode);
    document.querySelector(".header").classList.toggle("dark");
  };

  //const changeMssg = () => {setMssgCount()}

  return (
    <div className={`header ${darkMode ? "dark" : ""}`}>
      <div className="header-wrapper">
        <div className="header-left">
          <div className="header-text">
            Welcome back {user?.name || "User"}
          </div>
        </div>
        <div className="header-right">
          <div className="header-theme">
            <IconButton
              aria-label="toggle-theme"
              onClick={changeMode}
              className="notification-icon"
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </div>
          <div className="header-msg">
            <IconButton
              aria-label="Notifications"
              className="notification-icon"
            >
              <Badge
                badgeContent={mssgCount}
                color="error"
              >
                {/*onClick ={changeMssg}>*/}
                <Notifications />
              </Badge>
            </IconButton>
          </div>
          <div className="header-pic">
            <Avatar>
              <img
                src={user?.avatar || "/man1.jpg"}
                alt={user?.name || "User"}
                className="header-img"
                sx={{ width: 40, height: 40 }}
              />
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Headers;
