import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

interface Property {
  id: number;
  name: string;
  location: string;
  pricePerMonth: number;
  imageUrl: string;
  amenities: string[];
  bedrooms: number;
}

// Mock data for demonstration
const mockProperties: Property[] = [
  {
    id: 1,
    name: "Sunny Garden Apartment",
    location: "123 Main St, Cape Town",
    pricePerMonth: 12000,
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    amenities: ["WiFi", "Parking", "Pool", "Security"],
    bedrooms: 2,
  },
  {
    id: 2,
    name: "Urban Loft",
    location: "456 Park Ave, Johannesburg",
    pricePerMonth: 15000,
    imageUrl: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7",
    amenities: ["WiFi", "Gym", "24/7 Security", "Balcony"],
    bedrooms: 1,
  },
  {
    id: 3,
    name: "Seaside Villa",
    location: "789 Beach Rd, Durban",
    pricePerMonth: 20000,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    amenities: ["Pool", "Garden", "Beach Access", "Parking"],
    bedrooms: 4,
  },
  {
    id: 4,
    name: "Modern Studio Apartment",
    location: "101 Loop St, Cape Town",
    pricePerMonth: 8500,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    amenities: ["WiFi", "Air Conditioning", "Smart Lock", "Built-in Wardrobe"],
    bedrooms: 1,
  },
  {
    id: 5,
    name: "Family House with Garden",
    location: "25 Oak Avenue, Pretoria",
    pricePerMonth: 18000,
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
    amenities: ["Garden", "Double Garage", "Security System", "Outdoor Braai"],
    bedrooms: 3,
  },
  {
    id: 6,
    name: "Executive Penthouse",
    location: "300 Sandton Drive, Johannesburg",
    pricePerMonth: 35000,
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    amenities: ["Concierge", "Gym", "Private Roof Terrace", "Wine Cellar"],
    bedrooms: 3,
  },
  {
    id: 7,
    name: "Beachfront Apartment",
    location: "15 Marine Parade, Durban",
    pricePerMonth: 16000,
    imageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    amenities: ["Ocean View", "Pool", "Beachfront Access", "24/7 Security"],
    bedrooms: 2,
  },
  {
    id: 8,
    name: "Student Complex Unit",
    location: "42 University Road, Stellenbosch",
    pricePerMonth: 6500,
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
    amenities: ["Study Area", "WiFi", "Shuttle Service", "Communal Kitchen"],
    bedrooms: 1,
  },
  {
    id: 9,
    name: "Heritage Town House",
    location: "78 Long Street, Cape Town",
    pricePerMonth: 25000,
    imageUrl: "https://images.unsplash.com/photo-1600566752355-35792bedcfea",
    amenities: [
      "Period Features",
      "Wine Cellar",
      "City Views",
      "Private Garden",
    ],
    bedrooms: 4,
  },
];

const Properties: React.FC = () => {
  const [properties] = useState<Property[]>(mockProperties);

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Navbar />
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
                  src={property.imageUrl}
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
                    R{property.pricePerMonth.toLocaleString()} /month
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Properties;
