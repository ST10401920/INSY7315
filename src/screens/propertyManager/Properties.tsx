import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PropertyManagerNavbar from "../../components/PropertyManagerNavbar";
import Footer from "../../components/Footer";
import { getSupabaseToken } from "../../utils/supabaseToken";

// Function to fetch properties
const fetchProperties = async () => {
  const token = await getSupabaseToken();
  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await axios.get("http://localhost:3000/properties", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.properties;
};

interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  images: string[];
  amenities: string[];
  bedrooms: number;
}

// We'll fetch properties from the API

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchProperties();
        setProperties(data);
        setLoadError(null);
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load properties"
        );
        console.error("Error loading properties:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  const [newProperty, setNewProperty] = useState<Omit<Property, "id">>({
    name: "",
    location: "",
    price: 0,
    images: [],
    amenities: [],
    bedrooms: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getSupabaseToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const propertyData = {
        name: newProperty.name,
        location: newProperty.location,
        images: newProperty.images,
        bedrooms: newProperty.bedrooms,
        price: newProperty.price,
        amenities: newProperty.amenities.filter(
          (amenity) => amenity.trim() !== ""
        ),
      };

      // Make API call
      const response = await axios.post(
        "http://localhost:3000/properties",
        propertyData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Add the new property to the local state
      const newPropertyWithId = {
        ...newProperty,
        id: response.data.property.id,
      };

      setProperties([...properties, newPropertyWithId]);
      setIsModalOpen(false);

      // Reset form
      setNewProperty({
        name: "",
        location: "",
        price: 0,
        images: [],
        amenities: [],
        bedrooms: 1,
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        // If we have a response from the server with an error message
        const errorMessage =
          err.response.data?.error || err.response.data?.message || err.message;
        setError(errorMessage);
        console.error("Error adding property:", {
          status: err.response.status,
          data: err.response.data,
        });
      } else {
        setError(err instanceof Error ? err.message : "Failed to add property");
        console.error("Error adding property:", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <PropertyManagerNavbar />
      <div
        style={{
          flex: 1,
          padding: "2rem",
          paddingTop: "5rem",
          backgroundColor: "#f3f4f6",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
              My Properties
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: "linear-gradient(135deg, #50bc72, #41599c)",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.375rem",
                textDecoration: "none",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "none",
                cursor: "pointer",
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Property
            </button>
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Loading properties...
            </div>
          ) : loadError ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#DC2626",
                backgroundColor: "#FEE2E2",
                borderRadius: "0.5rem",
                margin: "1rem 0",
              }}
            >
              Error: {loadError}
            </div>
          ) : properties.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                backgroundColor: "#f8fafc",
                borderRadius: "0.5rem",
                color: "#64748b",
              }}
            >
              No properties found. Click "Add Property" to create your first
              property listing.
            </div>
          ) : (
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
                    src={property.images[0]} // Display first image
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
                      onClick={() => {}}
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
                      Edit Property
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
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
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                width: "90%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: "1.5rem", color: "#111827" }}>
                Add New Property
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#374151",
                    }}
                  >
                    Property Name
                    <input
                      type="text"
                      value={newProperty.name}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, name: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #D1D5DB",
                        borderRadius: "0.375rem",
                        marginTop: "0.25rem",
                        color: "#374151",
                        backgroundColor: "white",
                      }}
                      required
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#374151",
                    }}
                  >
                    Location
                    <input
                      type="text"
                      value={newProperty.location}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          location: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #D1D5DB",
                        borderRadius: "0.375rem",
                        marginTop: "0.25rem",
                        color: "#374151",
                        backgroundColor: "white",
                      }}
                      required
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#374151",
                    }}
                  >
                    Price per Month (R)
                    <input
                      type="number"
                      value={newProperty.price}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          price: Number(e.target.value),
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #D1D5DB",
                        borderRadius: "0.375rem",
                        marginTop: "0.25rem",
                        color: "#374151",
                        backgroundColor: "white",
                      }}
                      required
                      min="0"
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#374151",
                    }}
                  >
                    Number of Bedrooms
                    <input
                      type="number"
                      value={newProperty.bedrooms}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          bedrooms: Number(e.target.value),
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #D1D5DB",
                        borderRadius: "0.375rem",
                        marginTop: "0.25rem",
                        color: "#374151",
                        backgroundColor: "white",
                      }}
                      required
                      min="1"
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#374151",
                    }}
                  >
                    Property Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            // reader.result contains the base64 string
                            setNewProperty({
                              ...newProperty,
                              images: [reader.result as string],
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #D1D5DB",
                        borderRadius: "0.375rem",
                        marginTop: "0.25rem",
                        color: "#374151",
                      }}
                      required
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#374151",
                    }}
                  >
                    Amenities (comma-separated)
                    <input
                      type="text"
                      value={newProperty.amenities.join(", ")}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          amenities: e.target.value
                            .split(",")
                            .map((item) => item.trim()),
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #D1D5DB",
                        borderRadius: "0.375rem",
                        marginTop: "0.25rem",
                        color: "#374151",
                        backgroundColor: "white",
                      }}
                      placeholder="e.g., WiFi, Parking, Pool"
                    />
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "0.375rem",
                      border: "1px solid #D1D5DB",
                      backgroundColor: "white",
                      color: "#374151",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  {error && (
                    <div
                      style={{
                        padding: "0.75rem",
                        marginBottom: "1rem",
                        borderRadius: "0.375rem",
                        backgroundColor: "#FEE2E2",
                        color: "#DC2626",
                        border: "1px solid #FCA5A5",
                      }}
                    >
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "0.375rem",
                      border: "none",
                      background: "linear-gradient(135deg, #50bc72, #41599c)",
                      color: "white",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? "Saving..." : "Save Property"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Properties;
