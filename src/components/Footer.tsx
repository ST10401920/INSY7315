import React from "react";
//import styles from "../signinStyles";
import logo from "../assets/Nestify-Logo.png";

const Footer: React.FC = () => {
  return (
    <footer
      style={{ background: "#000", color: "white", padding: "48px 24px" }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "32px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <img
                src={logo}
                alt="Nestify Logo"
                style={{ width: "32px", height: "32px", borderRadius: "8px" }}
              />
              <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                Nestify
              </span>
            </div>
            <p style={{ color: "#9ca3af", lineHeight: "1.6" }}>
              The complete property rental management solution for modern
              property managers.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: "600", marginBottom: "16px" }}>Product</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "8px" }}>
                <a
                  href="#"
                  style={{ color: "#9ca3af", textDecoration: "none" }}
                >
                  Security
                </a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <a
                  href="#"
                  style={{ color: "#9ca3af", textDecoration: "none" }}
                >
                  Integrations
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontWeight: "600", marginBottom: "16px" }}>Company</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "8px" }}>
                <a
                  href="#"
                  style={{ color: "#9ca3af", textDecoration: "none" }}
                >
                  About
                </a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <a
                  href="#"
                  style={{ color: "#9ca3af", textDecoration: "none" }}
                >
                  Blog
                </a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <a
                  href="#"
                  style={{ color: "#9ca3af", textDecoration: "none" }}
                >
                  Careers
                </a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <a
                  href="#"
                  style={{ color: "#9ca3af", textDecoration: "none" }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontWeight: "600", marginBottom: "16px" }}>Support</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "8px" }}>
                <a
                  href="#"
                  style={{ color: "#9ca3af", textDecoration: "none" }}
                >
                  Help Center
                </a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <a
                  href="#"
                  style={{ color: "#9ca3af", textDecoration: "none" }}
                >
                  Documentation
                </a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <a
                  href="#"
                  style={{ color: "#9ca3af", textDecoration: "none" }}
                >
                  API Reference
                </a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <a
                  href="#"
                  style={{ color: "#9ca3af", textDecoration: "none" }}
                >
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid #374151",
            marginTop: "32px",
            paddingTop: "32px",
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          <p>&copy; 2025 Nestify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
