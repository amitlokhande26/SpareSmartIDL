import React, { useState } from "react";
import { Search } from "lucide-react";
import InventoryApp from "./components/InventoryApp"; // keep if you have it; otherwise it'll still render the header
import "./style.css"; // make sure this exists (see below)

export default function App() {
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  const handleGlobalSearch = () => {
    setShowGlobalSearch(!showGlobalSearch);
    if (!showGlobalSearch) {
      setGlobalSearchQuery("");
    }
  };

  return (
    <div className="app-root">
      {/* Global Header */}
      <header className="app-header">
        <div className="brand-wrap">
        <div className="brand">Spare<span className="brand-accent">Smart</span></div>
        <div className="brand-sub">Your Digital Inventory Partner</div>
        </div>
        <div className="header-right">
          <img
            src="/logo.png"
            alt="Company Logo"
            className="brand-logo"
          />
          <button 
            className="global-search-btn"
            onClick={handleGlobalSearch}
            title="Global Search"
          >
            <Search size={16} />
            <span>Global Search</span>
          </button>
        </div>
      </header>

      {/* Global Search Bar */}
      {showGlobalSearch && (
        <div className="global-search-bar">
          <input
            type="text"
            placeholder="Search all data (lines, machines, parts, checkweighers)..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="global-search-input"
            autoFocus
          />
          <button 
            className="close-search-btn"
            onClick={() => setShowGlobalSearch(false)}
            title="Close Search"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="app-main">
        {typeof InventoryApp === "function" ? (
          <InventoryApp globalSearchQuery={globalSearchQuery} />
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
