import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import axios from "axios";
import GooglePlayLogo from "./assets/google-play-store-logo-svgrepo-com.svg";
import AppScreenshot from "./assets/androidhome.jpeg"; // Add your app screenshot

interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  images: string[];
  amenities: string[];
  bedrooms: number;
  available: boolean;
}

// Properties will be fetched from the API

const ViewProperty: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log("Fetching properties...");
        const response = await axios.get(
          "https://insy7315-api-deploy.onrender.com/no-auth-properties"
        );
        console.log("API Response:", response);
        console.log("Response data:", response.data);

        if (
          response.data &&
          response.data.properties &&
          Array.isArray(response.data.properties)
        ) {
          console.log("Setting properties with:", response.data.properties);
          setProperties(response.data.properties);
        } else {
          console.error("Invalid data format received:", response.data);
          setError("Invalid data received from server");
        }
      } catch (err) {
        console.error("Error details:", err);
        setError("Failed to load properties. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Navbar />
      <div style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
        {loading ? (
          <div className="flex justify-center items-center h-full py-20">
            <div className="text-xl text-gray-600">Loading properties...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full py-20">
            <div className="text-xl text-red-600">{error}</div>
          </div>
        ) : (
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "2rem",
              paddingTop: "5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
              }}
            >
              <h1
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Available Properties
              </h1>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "2rem",
              }}
            >
              {properties.map((property) => (
                <div
                  key={property.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ padding: "1.5rem" }}>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        color: "#111827",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {property.name}
                    </h3>
                    <p
                      style={{
                        color: "#4b5563",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ width: "1.25rem", height: "1.25rem" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {property.location}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#4b5563",
                        marginBottom: "1rem",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ width: "1.25rem", height: "1.25rem" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      <span>
                        {property.bedrooms}{" "}
                        {property.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "600",
                        color: "#10B981",
                        marginBottom: "1rem",
                      }}
                    >
                      R{property.price.toLocaleString()} /month
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {property.amenities.map(
                        (amenity: string, index: number) => (
                          <span
                            key={index}
                            style={{
                              backgroundColor: "#f3f4f6",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "9999px",
                              fontSize: "0.875rem",
                              color: "#4b5563",
                            }}
                          >
                            {amenity}
                          </span>
                        )
                      )}
                    </div>
                    <button
                      onClick={() => setShowMobileModal(true)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        backgroundColor: "#f3f4f6",
                        color: "#4b5563",
                        border: "none",
                        borderRadius: "0.375rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ width: "1.25rem", height: "1.25rem" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Submit Application
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile App Modal */}
      {showMobileModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setShowMobileModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "600px",
              width: "100%",
              position: "relative",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowMobileModal(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#9ca3af",
                width: "2rem",
                height: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>

            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "1rem",
                }}
              >
                Get Our Mobile App!
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  marginBottom: "2rem",
                  fontSize: "1rem",
                }}
              >
                Submit applications and submit maintenance requests on the go
                with our mobile app.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2rem",
                  marginBottom: "2rem",
                }}
              >
                {/* Phone Mockup */}
                <div
                  style={{
                    position: "relative",
                    width: "180px",
                    height: "320px",
                    backgroundColor: "#1f2937",
                    borderRadius: "1.5rem",
                    padding: "1rem",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {/* Phone Screen */}
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#f9fafb",
                      borderRadius: "1rem",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {/* Status Bar */}
                    <div
                      style={{
                        height: "20px",
                        backgroundColor: "#111827",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 0.5rem",
                        fontSize: "0.7rem",
                        color: "white",
                      }}
                    >
                      {/* Empty status bar for cleaner look */}
                    </div>

                    {/* App Content */}
                    <div
                      style={{
                        padding: "0",
                        height: "calc(100% - 20px)",
                        overflow: "hidden",
                      }}
                    >
                      {/* App Screenshot */}
                      <img
                        src={AppScreenshot}
                        alt="HabitaTech App"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "0 0 1rem 1rem",
                        }}
                      />
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0.5rem",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60px",
                      height: "4px",
                      backgroundColor: "#6b7280",
                      borderRadius: "2px",
                    }}
                  ></div>
                </div>

                {/* Play Store Button */}
                <div style={{ textAlign: "center" }}>
                  <a
                    href="https://play.google.com/store"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: "none",
                      display: "inline-block",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#000",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minWidth: "200px",
                        cursor: "pointer",
                      }}
                    >
                      {/* Google Play Icon */}
                      <img
                        src={GooglePlayLogo}
                        alt="Google Play"
                        width="24"
                        height="24"
                        style={{ flexShrink: 0 }}
                      />

                      <div style={{ textAlign: "left" }}>
                        <div
                          style={{
                            color: "#fff",
                            fontSize: "10px",
                            lineHeight: "1",
                            marginBottom: "2px",
                          }}
                        >
                          GET IT ON
                        </div>
                        <div
                          style={{
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: "500",
                            lineHeight: "1",
                          }}
                        >
                          Google Play
                        </div>
                      </div>
                    </div>
                  </a>

                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "1rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "0.5rem",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        color: "#111827",
                        margin: "0 0 0.5rem 0",
                      }}
                    >
                      Features:
                    </h4>
                    <ul
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b7280",
                        margin: 0,
                        paddingLeft: "1rem",
                        listStyle: "disc",
                      }}
                    >
                      <li>Browse available properties</li>
                      <li>Submit rental applications</li>
                      <li>Track application status</li>
                      <li>Access to chatbot</li>
                      <li>Submit maintenance requests</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#eff6ff",
                  borderRadius: "0.5rem",
                  border: "1px solid #bfdbfe",
                }}
              >
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#1e40af",
                    margin: 0,
                    fontWeight: "500",
                  }}
                >
                  💡 Download our app for the best experience when applying for
                  properties and submitting maintenance requests for your
                  rentals!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ViewProperty;
