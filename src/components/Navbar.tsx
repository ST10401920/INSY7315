import React from "react";
import { Link } from "react-router-dom";
import styles from "../signinStyles";
import logo from "../assets/Nestify-Logo.png";

const Navbar: React.FC = () => (
  <header style={styles.floatingNavbar as React.CSSProperties}>
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 0",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src={logo}
              alt="Nestify Logo"
              style={{ width: "32px", height: "32px", borderRadius: "8px" }}
            />
            <span
              style={{ fontSize: "24px", fontWeight: "bold", color: "#000" }}
            >
              Nestify
            </span>
          </div>
        </Link>
        <nav style={{ display: "flex", gap: "32px" }}>
          <Link
            to="/properties"
            style={{
              color: "#374151",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            View Properties
          </Link>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            to="/login"
            style={{
              ...styles.button,
              background: "transparent",
              color: "#000",
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  </header>
);

export default Navbar;
