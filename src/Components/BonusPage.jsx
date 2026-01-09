import React from "react";
import { useNavigate } from "react-router-dom";

const BonusPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>About This Dashboard</h1>
      <p style={{ maxWidth: "600px", margin: "1rem auto", lineHeight: "1.6" }}>
        This dashboard is designed to manage your Actifs, Passifs, and Charges efficiently.
        Use the search and filter options to find data quickly. Click on buttons to edit or delete entries.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "0.5rem 1rem",
          marginTop: "1rem",
          cursor: "pointer",
          borderRadius: "5px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none"
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default BonusPage;
