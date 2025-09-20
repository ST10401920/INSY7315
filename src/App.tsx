import logo from "./assets/Nestify-Logo.png";
import { Routes, Route, Link } from "react-router-dom";
import SignIn from "./SignIn";
import CreateAccountPage from "./CreateAccount";
import ViewProperty from "./ViewProperty";
import Navbar from "./components/Navbar";
import RoleSelection from "./RoleSelection";
import AdminDashboard from "./screens/admin/Dashboard";
import Announcements from "./screens/admin/Announcements";
// Inline SVG Icons
const Building2Icon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);

const ShieldIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
);

const FileTextIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const CalculatorIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);

const WrenchIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const MessageCircleIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const BellIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const GlobeIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const ArrowRightIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const HomePage = () => {
  const features = [
    {
      icon: Building2Icon,
      title: "Property Management Dashboard",
      description:
        "Comprehensive web-based admin dashboard for managing all your properties and tenants in one place.",
    },
    {
      icon: ShieldIcon,
      title: "Secure Authentication",
      description:
        "Advanced security with SSO integration and biometric authentication options for peace of mind.",
    },
    {
      icon: FileTextIcon,
      title: "Property Listings & Applications",
      description:
        "Streamlined property listing module with automated rental application workflow management.",
    },
    {
      icon: CalculatorIcon,
      title: "Lease & Invoice Automation",
      description:
        "Automated lease generation and invoice processing with intelligent arrears monitoring.",
    },
    {
      icon: WrenchIcon,
      title: "Maintenance Management",
      description:
        "Complete maintenance request lifecycle management from submission to completion.",
    },
    {
      icon: MessageCircleIcon,
      title: "AI Chatbot Integration",
      description:
        "Intelligent AI-powered chatbot with smart escalation paths for enhanced tenant support and communication.",
    },
    {
      icon: BellIcon,
      title: "Smart Notifications",
      description:
        "Real-time push notifications to keep all stakeholders informed and engaged.",
    },
    {
      icon: GlobeIcon,
      title: "Multilingual Support",
      description:
        "Built-in multilingual messaging support to serve diverse tenant communities.",
    },
  ];

  const benefits = [
    "Reduce administrative overhead by 60%",
    "Automate rent collection and late payment tracking",
    "Streamline maintenance request resolution",
    "Improve tenant satisfaction and retention",
  ];

  const styles = {
    gradientBrand: {
      background: "linear-gradient(to right, #50bc72, #41599c)",
    },
    gradientText: {
      background: "linear-gradient(to right, #50bc72, #41599c)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    button: {
      padding: "12px 24px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "600",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s ease",
    },
    buttonPrimary: {
      background: "linear-gradient(to right, #50bc72, #41599c)",
      color: "white",
    },
    buttonSecondary: {
      background: "transparent",
      color: "#000",
      border: "2px solid #000",
    },
    buttonWhite: {
      background: "white",
      color: "#000",
    },
    card: {
      background: "white",
      padding: "24px",
      borderRadius: "16px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      border: "1px solid #f3f4f6",
      transition: "all 0.3s ease",
    },
    floatingNavbar: {
      position: "fixed",
      top: "16px",
      left: "16px",
      right: "16px",
      zIndex: 50,
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "24px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Floating Header */}
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          paddingTop: "128px",
          paddingBottom: "80px",
          padding: "128px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating Background Elements */}
        <div
          style={{
            position: "absolute",
            top: "-160px",
            right: "-160px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            opacity: 0.1,
            background: "linear-gradient(to right, #50bc72, #41599c)",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "-160px",
            left: "-160px",
            width: "384px",
            height: "384px",
            borderRadius: "50%",
            opacity: 0.05,
            background: "linear-gradient(to right, #50bc72, #41599c)",
          }}
        ></div>

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <h1
            style={{
              fontSize: "60px",
              fontWeight: "bold",
              color: "#000",
              marginBottom: "24px",
              lineHeight: "1.1",
            }}
          >
            Streamline Your
            <div style={styles.gradientText}>Property Operations</div>
          </h1>
          <p
            style={{
              fontSize: "20px",
              color: "#6b7280",
              marginBottom: "32px",
              maxWidth: "768px",
              margin: "0 auto 32px",
              lineHeight: "1.6",
            }}
          >
            The complete property rental management system that automates
            workflows, enhances tenant experience, and maximizes your
            operational efficiency.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <a
              href="/properties"
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                fontSize: "18px",
                padding: "16px 32px",
              }}
            >
              Browse Properties
              <ArrowRightIcon />
            </a>
            <a
              href="/CreateAccount"
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                fontSize: "18px",
                padding: "16px 32px",
              }}
            >
              Sign Up
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "80px 24px", background: "#f9fafb" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#000",
                marginBottom: "24px",
              }}
            >
              Everything You Need to Manage Properties
            </h2>
            <p
              style={{
                fontSize: "20px",
                color: "#6b7280",
                maxWidth: "768px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              Comprehensive tools and features designed to streamline every
              aspect of your property management operations.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "32px",
            }}
          >
            {features.map((feature, index) => (
              <div key={index} style={styles.card}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...styles.gradientBrand,
                  }}
                >
                  <feature.icon style={{ color: "white" }} />
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#000",
                    marginBottom: "12px",
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transform Section */}
      <section style={{ padding: "80px 24px", background: "white" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "#000",
                  marginBottom: "24px",
                }}
              >
                Transform Your Property Management
              </h2>
              <p
                style={{
                  fontSize: "20px",
                  color: "#6b7280",
                  marginBottom: "32px",
                  lineHeight: "1.6",
                }}
              >
                Experience the power of modern property management with
                Nestify's comprehensive platform designed to maximize efficiency
                and tenant satisfaction.
              </p>
              <div style={{ marginBottom: "32px" }}>
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ...styles.gradientBrand,
                      }}
                    >
                      <ArrowRightIcon
                        style={{
                          width: "12px",
                          height: "12px",
                          color: "white",
                        }}
                      />
                    </div>
                    <span style={{ color: "#374151", fontWeight: "500" }}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
              <a
                href="/login"
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  fontSize: "18px",
                  padding: "16px 32px",
                }}
              >
                Start Your Transformation
                <ArrowRightIcon />
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  ...styles.gradientBrand,
                  borderRadius: "24px",
                  padding: "32px",
                  color: "white",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                      }}
                    >
                      98%
                    </div>
                    <div style={{ fontSize: "14px", opacity: 0.9 }}>
                      Tenant Satisfaction
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                      }}
                    >
                      60%
                    </div>
                    <div style={{ fontSize: "14px", opacity: 0.9 }}>
                      Time Saved
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                      }}
                    >
                      R2.5M+
                    </div>
                    <div style={{ fontSize: "14px", opacity: 0.9 }}>
                      Revenue Managed
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                      }}
                    >
                      24/7
                    </div>
                    <div style={{ fontSize: "14px", opacity: 0.9 }}>
                      Support Available
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "80px 24px", ...styles.gradientBrand }}>
        <div
          style={{ maxWidth: "1024px", margin: "0 auto", textAlign: "center" }}
        >
          <h2
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "24px",
            }}
          >
            Ready to Revolutionize Your Property Management?
          </h2>
          <p
            style={{
              fontSize: "20px",
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: "32px",
              lineHeight: "1.6",
            }}
          >
            Join thousands of property managers who trust Nestify to streamline
            their operations and maximize their success.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <a
              href="/properties"
              style={{
                ...styles.button,
                ...styles.buttonWhite,
                fontSize: "18px",
                padding: "16px 32px",
              }}
            >
              Browse Properties
            </a>
            <a
              href="/CreateAccount"
              style={{
                ...styles.button,
                background: "transparent",
                color: "white",
                border: "2px solid white",
                fontSize: "18px",
                padding: "16px 32px",
              }}
            >
              Sign Up
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
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
              <h3 style={{ fontWeight: "600", marginBottom: "16px" }}>
                Product
              </h3>
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
              <h3 style={{ fontWeight: "600", marginBottom: "16px" }}>
                Company
              </h3>
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
              <h3 style={{ fontWeight: "600", marginBottom: "16px" }}>
                Support
              </h3>
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
            <p>&copy; 2024 Nestify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Import the Task and UserManagement page components
import Task from "./screens/caretaker/Task";
import UserManagement from "./screens/admin/UserManagement";
import Property from "./screens/propertyManager/Properties";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/CreateAccount" element={<CreateAccountPage />} />
      <Route path="/RoleSelection" element={<RoleSelection />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/announcements" element={<Announcements />} />
      <Route path="/caretaker/tasks" element={<Task />} />
      <Route path="/propertymanager/properties" element={<Property />} />
      <Route path="/properties" element={<ViewProperty />} />
    </Routes>
  );
}

export default App;
