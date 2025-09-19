import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import axios from "axios";

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

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log("Fetching properties...");
        const response = await axios.get(
          "http://localhost:3000/no-auth-properties"
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
                    <Link to={`/application-property/${property.id}`}>
                      <button
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
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ViewProperty;
