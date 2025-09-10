import React from "react";
import InventoryApp from "./components/InventoryApp"; // keep if you have it; otherwise it'll still render the header
import "./style.css"; // make sure this exists (see below)

export default function App() {
  return (
    <div className="app-root">
      {/* Global Header */}
      <header className="app-header">
        <div className="brand-wrap">
        <div className="brand">Spare<span className="brand-accent">Smart</span></div>
        <div className="brand-sub">Your Digital Inventory Partner</div>
        </div>
        <img
          src="/logo.png"
          alt="Company Logo"
          className="brand-logo"
        />
      </header>

      {/* Main content */}
      <main className="app-main">
        {typeof InventoryApp === "function" ? (
          <InventoryApp />
        ) : (
          <div className="placeholder">
            <h2>Your app content goes here</h2>
            <p>If InventoryApp is missing, create it at <code>src/components/InventoryApp.jsx</code>.</p>
          </div>
        )}
      </main>
    </div>
  );
}
