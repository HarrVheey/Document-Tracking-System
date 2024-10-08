import React from "react";
import logo from "./assets/kabankalan-logo.png";

const Header = () => {
  return (
    <>
      {/*Header*/}
      <header>
        <nav className="header">
          <div className="logo">
            <img src={logo} alt="logo"></img>
            <h1>City Government of Kabankalan</h1>
          </div>
          <div className="essentials">
            <h5>Document Tracking System</h5>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
