import React, { useMemo, useState } from "react";
import { Plus, Trash2, Package, Layers, Wrench, Scale } from "lucide-react";

/** ----- Initial Data ----- **/
const initialData = {
  lines: [
    { id: 1, name: "Canning Line 1" },
    { id: 2, name: "Canning Line 2" },
    { id: 3, name: "Kegging Line" },
    { id: 4, name: "Bottling Line 1" },
    { id: 5, name: "Bottling Line 2" },
  ],

  // Pre-seed Canning Line 2 with your exact sequence
  machines: [
    { id: 2001, name: "Depal", lineId: 2 },
    { id: 2002, name: "Carbonator", lineId: 2 },
    { id: 2003, name: "Filler", lineId: 2 },
    { id: 2004, name: "Seamer", lineId: 2 },
    { id: 2005, name: "X-Ray", lineId: 2 },
    { id: 2006, name: "Printers", lineId: 2 },
    { id: 2007, name: "Westrock", lineId: 2 },
    { id: 2008, name: "Cluster Checkweigher", lineId: 2 },
    { id: 2009, name: "Fibre King", lineId: 2 },
    { id: 2010, name: "Palletiser", lineId: 2 },
  ],

  parts: [
    
  ],

  // Per-line Checkweighers
  checkweighers: [
    
  ],
};

/** Desired display order for Canning Line 2 machines */
const cl2Order = [
  "Depal",
  "Carbonator",
  "Filler",
  "Seamer",
  "X-Ray",
  "Printers",
  "Westrock",
  "Cluster Checkweigher",
  "Fibre King",
  "Palletiser",
];

export default function InventoryApp({ globalSearchQuery = "" }) {
  const [data, setData] = useState(initialData);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);

  // Authentication (very simple localStorage-based)
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem("authUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const handleLogin = (e) => {
    e.preventDefault();
    const username = loginForm.username.trim();
    const password = loginForm.password;
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }
    // Demo credential. Change as needed.
    if (username === "admin" && password === "admin") {
      const user = { username };
      localStorage.setItem("authUser", JSON.stringify(user));
      setAuthUser(user);
      return;
    }
    alert("Invalid credentials");
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setAuthUser(null);
    setSelectedLine(null);
    setSelectedMachine(null);
  };

  // 🔎 Search states
  const [machineQuery, setMachineQuery] = useState("");
  const [partQuery, setPartQuery] = useState("");

  // View mode under the selected line (Machines | Checkweighers)
  const [viewMode, setViewMode] = useState("machines");

  // Simple highlight helper
  const highlight = (text, q) => {
    if (!q) return text;
    const i = text?.toString().toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    const end = i + q.length;
    return (
      <>
        {text.slice(0, i)}
        <span className="hl">{text.slice(i, end)}</span>
        {text.slice(end)}
      </>
    );
  };

  // Inline Add-Part form state
  const [newPart, setNewPart] = useState({
    name: "",
    partNumber: "",
    qty: "",
    location: "",
    lastChecked: "",
    nextDue: "",
    cost: "",
    others: "",
  });

  // Inline Add-Checkweigher form state
  const [newCW, setNewCW] = useState({
    name: "",
    lastCalibrated: "",
    nextDue: "",
  });

  const lines = data.lines;

  // Machines for the selected line, sorted with Canning Line 2 order if applicable
  const machines = useMemo(() => {
    if (!selectedLine) return [];
    const list = data.machines.filter((m) => m.lineId === selectedLine.id);

    if (selectedLine.name === "Canning Line 2") {
      const idx = new Map(cl2Order.map((n, i) => [n, i]));
      return [...list].sort((a, b) => {
        const ia = idx.has(a.name) ? idx.get(a.name) : 999;
        const ib = idx.has(b.name) ? idx.get(b.name) : 999;
        if (ia !== ib) return ia - ib;
        return a.name.localeCompare(b.name);
      });
    }

    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [data.machines, selectedLine]);

  // Parts for the selected machine
  const parts = useMemo(() => {
    if (!selectedMachine) return [];
    return data.parts.filter((p) => p.machineId === selectedMachine.id);
  }, [data.parts, selectedMachine]);

  // Global search function
  const globalSearch = useMemo(() => {
    if (!globalSearchQuery) return { lines: [], machines: [], parts: [], checkweighers: [] };
    
    const query = globalSearchQuery.toLowerCase();
    const results = {
      lines: data.lines.filter(line => 
        line.name.toLowerCase().includes(query)
      ),
      machines: data.machines.filter(machine => 
        machine.name.toLowerCase().includes(query)
      ),
      parts: data.parts.filter(part => 
        (part.name || "").toLowerCase().includes(query) ||
        (part.partNumber || "").toLowerCase().includes(query) ||
        (part.location || "").toLowerCase().includes(query) ||
        (part.others || "").toLowerCase().includes(query)
      ),
      checkweighers: data.checkweighers.filter(cw => 
        cw.name.toLowerCase().includes(query)
      )
    };
    return results;
  }, [data, globalSearchQuery]);

  // Search filters
  const machinesFiltered = useMemo(() => {
    if (globalSearchQuery) {
      return globalSearch.machines.filter((m) => !selectedLine || m.lineId === selectedLine.id);
    }
    if (!machineQuery) return machines;
    return machines.filter((m) =>
      m.name.toLowerCase().includes(machineQuery.toLowerCase())
    );
  }, [machines, machineQuery, globalSearchQuery, globalSearch.machines, selectedLine]);

  const partsFiltered = useMemo(() => {
    if (globalSearchQuery) {
      return globalSearch.parts.filter((p) => !selectedMachine || p.machineId === selectedMachine.id);
    }
    if (!partQuery) return parts;
    const q = partQuery.toLowerCase();
    return parts.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.partNumber || "").toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q) ||
        (p.others || "").toLowerCase().includes(q)
    );
  }, [parts, partQuery, globalSearchQuery, globalSearch.parts, selectedMachine]);

  // Checkweighers for selected line
  const checkweighers = useMemo(() => {
    if (!selectedLine) return [];
    return data.checkweighers.filter((c) => c.lineId === selectedLine.id);
  }, [data.checkweighers, selectedLine]);

  /** ----- Machines ----- **/
  const addMachine = () => {
    if (!selectedLine) return;
    const name = prompt("Enter machine name:");
    if (!name) return;

    const newMachine = { id: Date.now(), name: name.trim(), lineId: selectedLine.id };
    setData((prev) => ({ ...prev, machines: [...prev.machines, newMachine] }));
  };

  /** ----- Parts ----- **/
  const addPart = () => {
    if (!selectedMachine) return;

    const payload = {
      id: Date.now(),
      machineId: selectedMachine.id,
      name: newPart.name.trim(),
      partNumber: newPart.partNumber.trim(),
      qty: Number(newPart.qty || 0),
      location: newPart.location.trim(),
      lastChecked: newPart.lastChecked || "",
      nextDue: newPart.nextDue || "",
      cost: newPart.cost === "" ? "" : Number(newPart.cost),
      others: newPart.others.trim(),
    };

    if (!payload.name) {
      alert("Please enter Part Name");
      return;
    }

    setData((prev) => ({ ...prev, parts: [...prev.parts, payload] }));
    setNewPart({
      name: "",
      partNumber: "",
      qty: "",
      location: "",
      lastChecked: "",
      nextDue: "",
      cost: "",
      others: "",
    });
  };

  const updatePart = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      parts: prev.parts.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const deletePart = (id) => {
    setData((prev) => ({ ...prev, parts: prev.parts.filter((p) => p.id !== id) }));
  };

  /** ----- Checkweighers CRUD ----- **/
  const addCheckweigher = () => {
    if (!selectedLine) return;
    if (!newCW.name.trim()) {
      alert("Please enter Checkweigher name");
      return;
    }
    const cw = {
      id: Date.now(),
      lineId: selectedLine.id,
      name: newCW.name.trim(),
      lastCalibrated: newCW.lastCalibrated || "",
      nextDue: newCW.nextDue || "",
    };
    setData((prev) => ({ ...prev, checkweighers: [...prev.checkweighers, cw] }));
    setNewCW({ name: "", lastCalibrated: "", nextDue: "" });
  };

  const updateCheckweigher = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      checkweighers: prev.checkweighers.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const deleteCheckweigher = (id) => {
    setData((prev) => ({
      ...prev,
      checkweighers: prev.checkweighers.filter((c) => c.id !== id),
    }));
  };

  // Login screen
  if (!authUser) {
    return (
      <div className="page-shell">
        <div className="container">
          <div className="card" style={{ maxWidth: 420, margin: "64px auto" }}>
            <h1 className="page-title" style={{ textAlign: "center" }}>
              <Package size={28} className="title-icon" /> Sign in
            </h1>
            <form onSubmit={handleLogin}>
              <div className="search-row">
                <input
                  className="input"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm((s) => ({ ...s, username: e.target.value }))}
                />
              </div>
              <div className="search-row">
                <input
                  className="input"
                  placeholder="Password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((s) => ({ ...s, password: e.target.value }))}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button type="submit" className="pill-btn primary">
                  Sign in
                </button>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, textAlign: "center", opacity: 0.8 }}>
                Default creds: admin / admin
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container">
        {/* Title */}
        <h1 className="page-title">
          <Package size={28} className="title-icon" /> Packaging Line Inventory
        </h1>
        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <button onClick={handleLogout} className="pill-btn danger sm" title="Logout">
            Signed in as {authUser.username} — Logout
          </button>
        </div>

        {/* Global Search Results */}
        {globalSearchQuery && (
          <div className="card">
            <h2 className="card-title">
              🔍 Global Search Results for "{globalSearchQuery}"
            </h2>
            
            {/* Lines Results */}
            {globalSearch.lines.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#4f46e5', marginBottom: 8 }}>Lines ({globalSearch.lines.length})</h3>
                <div className="btn-group">
                  {globalSearch.lines.map((line) => (
                    <button
                      key={line.id}
                      onClick={() => {
                        setSelectedLine(line);
                        setSelectedMachine(null);
                        setViewMode("machines");
                      }}
                      className="pill-btn"
                    >
                      {highlight(line.name, globalSearchQuery)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Machines Results */}
            {globalSearch.machines.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#4f46e5', marginBottom: 8 }}>Machines ({globalSearch.machines.length})</h3>
                <div className="btn-group">
                  {globalSearch.machines.map((machine) => {
                    const line = data.lines.find(l => l.id === machine.lineId);
                    return (
                      <button
                        key={machine.id}
                        onClick={() => {
                          setSelectedLine(line);
                          setSelectedMachine(machine);
                          setViewMode("machines");
                        }}
                        className="pill-btn"
                        title={`${machine.name} (${line?.name || 'Unknown Line'})`}
                      >
                        {highlight(machine.name, globalSearchQuery)}
                        {line && <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 4 }}>({line.name})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Parts Results */}
            {globalSearch.parts.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#4f46e5', marginBottom: 8 }}>Parts ({globalSearch.parts.length})</h3>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Part Number</th>
                        <th>Machine</th>
                        <th>Line</th>
                        <th>Location</th>
                        <th>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {globalSearch.parts.map((part, idx) => {
                        const machine = data.machines.find(m => m.id === part.machineId);
                        const line = machine ? data.lines.find(l => l.id === machine.lineId) : null;
                        return (
                          <tr key={part.id} className={idx % 2 ? "row-alt" : ""}>
                            <td>{highlight(part.name || "", globalSearchQuery)}</td>
                            <td>{highlight(part.partNumber || "", globalSearchQuery)}</td>
                            <td>{machine?.name || 'Unknown'}</td>
                            <td>{line?.name || 'Unknown'}</td>
                            <td>{highlight(part.location || "", globalSearchQuery)}</td>
                            <td className="td-center">{part.qty || 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Checkweighers Results */}
            {globalSearch.checkweighers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#4f46e5', marginBottom: 8 }}>Checkweighers ({globalSearch.checkweighers.length})</h3>
                <div className="btn-group">
                  {globalSearch.checkweighers.map((cw) => {
                    const line = data.lines.find(l => l.id === cw.lineId);
                    return (
                      <button
                        key={cw.id}
                        onClick={() => {
                          setSelectedLine(line);
                          setSelectedMachine(null);
                          setViewMode("checkweighers");
                        }}
                        className="pill-btn"
                        title={`${cw.name} (${line?.name || 'Unknown Line'})`}
                      >
                        {highlight(cw.name, globalSearchQuery)}
                        {line && <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 4 }}>({line.name})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Results */}
            {globalSearch.lines.length === 0 && globalSearch.machines.length === 0 && 
             globalSearch.parts.length === 0 && globalSearch.checkweighers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                No results found for "{globalSearchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Line Selection */}
        <div className="card">
          <h2 className="card-title">Select a Line</h2>
          <div className="btn-group">
            {lines.map((line) => {
              const active = selectedLine?.id === line.id;
              return (
                <button
                  key={line.id}
                  onClick={() => {
                    setSelectedLine(line);
                    setSelectedMachine(null);
                    setViewMode("machines"); // default to Machines when choosing a line
                  }}
                  aria-pressed={active}
                  className={`pill-btn ${active ? "is-active" : ""}`}
                >
                  {line.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode toggle UNDER the selected line */}
        {selectedLine && (
          <div className="card">
            <h2 className="card-title">
              {selectedLine.name}
            </h2>
            <div className="btn-group" style={{ marginBottom: 8 }}>
              <button
                onClick={() => setViewMode("machines")}
                aria-pressed={viewMode === "machines"}
                className={`pill-btn ${viewMode === "machines" ? "is-active-dark" : ""}`}
              >
                <Layers size={16} style={{ marginRight: 6 }} />
                Machines
              </button>
              <button
                onClick={() => {
                  setSelectedMachine(null); // clear machine selection when switching
                  setViewMode("checkweighers");
                }}
                aria-pressed={viewMode === "checkweighers"}
                className={`pill-btn ${viewMode === "checkweighers" ? "is-active-dark" : ""}`}
              >
                <Scale size={16} style={{ marginRight: 6 }} />
                Checkweighers
              </button>
            </div>

            {/* Machines for the selected line */}
            {viewMode === "machines" && (
              <>
                <div className="search-row">
                  <input
                    className="input"
                    placeholder="Search machines…"
                    value={machineQuery}
                    onChange={(e) => setMachineQuery(e.target.value)}
                  />
                </div>

                <div className="btn-group">
                  {machinesFiltered.map((m) => {
                    const active = selectedMachine?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMachine(m)}
                        aria-pressed={active}
                        className={`pill-btn ${active ? "is-active-dark" : ""}`}
                        title={m.name}
                      >
                        {highlight(m.name, machineQuery)}
                      </button>
                    );
                  })}
                  <button onClick={addMachine} className="pill-btn is-action">
                    <Plus size={16} /> Add Machine
                  </button>
                </div>
              </>
            )}

            {/* Parts for the selected machine */}
            {selectedMachine && viewMode === "machines" && (
              <div className="card" style={{ marginTop: 16 }}>
                <h2 className="card-title">
                  <Wrench size={18} className="sub-icon purple" /> Parts for {selectedMachine.name}
                </h2>

                <div className="search-row">
                  <input
                    className="input"
                    placeholder="Search parts…"
                    value={partQuery}
                    onChange={(e) => setPartQuery(e.target.value)}
                  />
                </div>

                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Part Number</th>
                        <th>Qty</th>
                        <th>Location</th>
                        <th>Last Checked</th>
                        <th>Next Check Due</th>
                        <th>Cost</th>
                        <th>Others</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partsFiltered.map((p, idx) => (
                        <tr key={p.id} className={idx % 2 ? "row-alt" : ""}>
                          <td>{highlight(p.name || "", partQuery)}</td>
                          <td>{highlight(p.partNumber || "", partQuery)}</td>
                          <td className="td-center">
                            <input
                              type="number"
                              value={p.qty ?? 0}
                              onChange={(e) => updatePart(p.id, "qty", Number(e.target.value))}
                              className="input sm"
                            />
                          </td>
                          <td>{highlight(p.location || "", partQuery)}</td>
                          <td>
                            <input
                              type="date"
                              value={p.lastChecked || ""}
                              onChange={(e) => updatePart(p.id, "lastChecked", e.target.value)}
                              className="input"
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              value={p.nextDue || ""}
                              onChange={(e) => updatePart(p.id, "nextDue", e.target.value)}
                              className="input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              value={p.cost ?? ""}
                              onChange={(e) =>
                                updatePart(
                                  p.id,
                                  "cost",
                                  e.target.value === "" ? "" : Number(e.target.value)
                                )
                              }
                              className="input sm"
                            />
                          </td>
                          <td>{highlight(p.others || "", partQuery)}</td>
                          <td className="td-center">
                            <button
                              onClick={() => deletePart(p.id)}
                              className="pill-btn danger sm"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Inline Add Part row */}
                      <tr className={parts.length % 2 ? "row-alt" : ""}>
                        <td>
                          <input
                            placeholder="Name"
                            value={newPart.name}
                            onChange={(e) => setNewPart((s) => ({ ...s, name: e.target.value }))}
                            className="input"
                          />
                        </td>
                        <td>
                          <input
                            placeholder="Part Number"
                            value={newPart.partNumber}
                            onChange={(e) =>
                              setNewPart((s) => ({ ...s, partNumber: e.target.value }))
                            }
                            className="input"
                          />
                        </td>
                        <td className="td-center">
                          <input
                            type="number"
                            placeholder="0"
                            value={newPart.qty}
                            onChange={(e) => setNewPart((s) => ({ ...s, qty: e.target.value }))}
                            className="input sm"
                          />
                        </td>
                        <td>
                          <input
                            placeholder="Location"
                            value={newPart.location}
                            onChange={(e) => setNewPart((s) => ({ ...s, location: e.target.value }))}
                            className="input"
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={newPart.lastChecked}
                            onChange={(e) =>
                              setNewPart((s) => ({ ...s, lastChecked: e.target.value }))
                            }
                            className="input"
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={newPart.nextDue}
                            onChange={(e) => setNewPart((s) => ({ ...s, nextDue: e.target.value }))}
                            className="input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={newPart.cost}
                            onChange={(e) => setNewPart((s) => ({ ...s, cost: e.target.value }))}
                            className="input sm"
                          />
                        </td>
                        <td>
                          <input
                            placeholder="Notes / Others"
                            value={newPart.others}
                            onChange={(e) => setNewPart((s) => ({ ...s, others: e.target.value }))}
                            className="input"
                          />
                        </td>
                        <td className="td-center">
                          <button onClick={addPart} className="pill-btn primary sm" title="Add">
                            <Plus size={16} />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Checkweighers panel for selected line */}
            {viewMode === "checkweighers" && (
              <div className="card" style={{ marginTop: 16 }}>
                <h2 className="card-title">
                  <Scale size={18} className="sub-icon" /> Checkweighers — {selectedLine.name}
                </h2>

                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Last Calibrated</th>
                        <th>Next Calibration Due</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkweighers.map((c, idx) => (
                        <tr key={c.id} className={idx % 2 ? "row-alt" : ""}>
                          <td>
                            <input
                              value={c.name}
                              onChange={(e) => updateCheckweigher(c.id, "name", e.target.value)}
                              className="input"
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              value={c.lastCalibrated || ""}
                              onChange={(e) =>
                                updateCheckweigher(c.id, "lastCalibrated", e.target.value)
                              }
                              className="input"
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              value={c.nextDue || ""}
                              onChange={(e) => updateCheckweigher(c.id, "nextDue", e.target.value)}
                              className="input"
                            />
                          </td>
                          <td className="td-center">
                            <button
                              onClick={() => deleteCheckweigher(c.id)}
                              className="pill-btn danger sm"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Inline Add Checkweigher row */}
                      <tr className={checkweighers.length % 2 ? "row-alt" : ""}>
                        <td>
                          <input
                            placeholder="Checkweigher name"
                            value={newCW.name}
                            onChange={(e) => setNewCW((s) => ({ ...s, name: e.target.value }))}
                            className="input"
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={newCW.lastCalibrated}
                            onChange={(e) =>
                              setNewCW((s) => ({ ...s, lastCalibrated: e.target.value }))
                            }
                            className="input"
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={newCW.nextDue}
                            onChange={(e) => setNewCW((s) => ({ ...s, nextDue: e.target.value }))}
                            className="input"
                          />
                        </td>
                        <td className="td-center">
                          <button onClick={addCheckweigher} className="pill-btn primary sm" title="Add">
                            <Plus size={16} />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
