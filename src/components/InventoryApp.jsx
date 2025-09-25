import React, { useMemo, useState, useEffect } from "react";
import { Plus, Trash2, Package, Layers, Wrench, Scale } from "lucide-react";
import { useInventory } from '../hooks/useInventory.js';

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
  // Supabase integration
  const {
    parts: supabaseParts,
    machines: supabaseMachines,
    lines: supabaseLines,
    checkweighers: supabaseCheckweighers,
    loading,
    error,
    createPart: createSupabasePart,
    updatePart: updateSupabasePart,
    deletePart: deleteSupabasePart,
    createMachine: createSupabaseMachine,
    updateMachine: updateSupabaseMachine,
    deleteMachine: deleteSupabaseMachine,
    createLine: createSupabaseLine,
    updateLine: updateSupabaseLine,
    deleteLine: deleteSupabaseLine,
    createCheckweigher: createSupabaseCheckweigher,
    updateCheckweigher: updateSupabaseCheckweigher,
    deleteCheckweigher: deleteSupabaseCheckweigher,
    globalSearch: supabaseGlobalSearch
  } = useInventory();

  // Local state for UI (preserving original behavior)
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
  const [aggregatedPartQuery, setAggregatedPartQuery] = useState("");

  // View mode under the selected line (Machines | Checkweighers | AggregatedParts)
  const [viewMode, setViewMode] = useState("machines");
  const [showAggregatedParts, setShowAggregatedParts] = useState(false);

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
    minQuantity: "",
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

  // Sync Supabase data with local state
  useEffect(() => {
    if (supabaseLines && supabaseMachines && supabaseParts && supabaseCheckweighers) {
      // Convert Supabase data to match your original format
      const convertedLines = supabaseLines.map(line => ({
        id: line.id,
        name: line.name,
        created_at: line.created_at
      }));
      
      const convertedMachines = supabaseMachines.map(machine => ({
        id: machine.id,
        name: machine.name,
        lineId: machine.line_id,
        created_at: machine.created_at
      }));
      
      const convertedParts = supabaseParts.map(part => ({
        id: part.id,
        machineId: part.machine_id,
        name: part.name,
        partNumber: part.part_number || '',
        qty: part.stock_quantity || 0,
        minQuantity: part.min_stock_level || 0,
        location: part.location || '',
        lastChecked: part.last_checked || '',
        nextDue: part.next_due || '',
        cost: part.cost || '',
        others: part.others || '',
        lowStock: (part.stock_quantity || 0) < (part.min_stock_level || 0)
      }));
      
      const convertedCheckweighers = supabaseCheckweighers.map(cw => ({
        id: cw.id,
        lineId: cw.line_id,
        name: cw.name,
        lastCalibrated: cw.last_calibrated || '',
        nextDue: cw.next_due || ''
      }));

      setData({
        lines: convertedLines.length > 0 ? convertedLines : initialData.lines,
        machines: convertedMachines,
        parts: convertedParts,
        checkweighers: convertedCheckweighers
      });
    }
  }, [supabaseLines, supabaseMachines, supabaseParts, supabaseCheckweighers]);

  // Sort lines by creation order (newest at the end)
  const lines = useMemo(() => {
    return [...data.lines].sort((a, b) => {
      // If lines have created_at timestamps, use those
      if (a.created_at && b.created_at) {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      // Otherwise, maintain insertion order (newest at the end)
      return 0;
    });
  }, [data.lines]);

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

    // For other lines, sort by creation order (newest at the end)
    return [...list].sort((a, b) => {
      // If machines have created_at timestamps, use those
      if (a.created_at && b.created_at) {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      // Otherwise, maintain insertion order (newest at the end)
      return 0;
    });
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

  // Aggregated parts by part number across all machines
  const aggregatedParts = useMemo(() => {
    const partMap = new Map();
    
    data.parts.forEach(part => {
      const partNumber = part.partNumber?.trim();
      if (!partNumber) return;
      
      if (partMap.has(partNumber)) {
        const existing = partMap.get(partNumber);
        existing.totalQty += part.qty || 0;
        existing.minQuantity = Math.max(existing.minQuantity, part.minQuantity || 0);
        existing.locations.push({
          machineId: part.machineId,
          qty: part.qty || 0,
          location: part.location || '',
          partId: part.id
        });
        existing.machines.add(part.machineId);
        const machine = data.machines.find(m => m.id === part.machineId);
        if (machine?.lineId) {
          existing.lines.add(machine.lineId);
        }
      } else {
        const machine = data.machines.find(m => m.id === part.machineId);
        const line = machine ? data.lines.find(l => l.id === machine.lineId) : null;
        
        partMap.set(partNumber, {
          partNumber,
          name: part.name || '',
          totalQty: part.qty || 0,
          minQuantity: part.minQuantity || 0,
          cost: part.cost || '',
          others: part.others || '',
          locations: [{
            machineId: part.machineId,
            qty: part.qty || 0,
            location: part.location || '',
            partId: part.id
          }],
          machines: new Set([part.machineId]),
          lines: new Set(machine?.lineId ? [machine.lineId] : []),
          lastChecked: part.lastChecked || '',
          nextDue: part.nextDue || '',
          lowStock: false
        });
      }
    });
    
    // Convert to array and calculate low stock status
    return Array.from(partMap.values()).map(part => ({
      ...part,
      machines: Array.from(part.machines),
      lines: Array.from(part.lines),
      lowStock: part.totalQty < part.minQuantity
    }));
  }, [data.parts, data.machines, data.lines]);

  // Filtered aggregated parts
  const aggregatedPartsFiltered = useMemo(() => {
    if (!aggregatedPartQuery) return aggregatedParts;
    const q = aggregatedPartQuery.toLowerCase();
    return aggregatedParts.filter(part =>
      (part.name || "").toLowerCase().includes(q) ||
      (part.partNumber || "").toLowerCase().includes(q) ||
      part.locations.some(loc => (loc.location || "").toLowerCase().includes(q))
    );
  }, [aggregatedParts, aggregatedPartQuery]);

  /** ----- Lines ----- **/
  const addLine = async () => {
    const name = prompt("Enter line name:");
    if (!name) return;

    try {
      // Create in Supabase
      const supabaseLine = await createSupabaseLine({
        name: name.trim(),
        description: '',
        location: '',
        capacity: null,
        efficiency: null
      });

      // Update local state
      const newLine = { 
        id: supabaseLine.id, 
        name: name.trim(),
        created_at: supabaseLine.created_at
      };
      setData((prev) => ({ ...prev, lines: [...prev.lines, newLine] }));
    } catch (error) {
      console.error('Error creating line:', error);
      alert('Failed to create line. Please try again.');
    }
  };

  /** ----- Machines ----- **/
  const addMachine = async () => {
    if (!selectedLine) return;
    const name = prompt("Enter machine name:");
    if (!name) return;

    try {
      // Create in Supabase
      const supabaseMachine = await createSupabaseMachine({
        name: name.trim(),
        line_id: selectedLine.id,
        description: '',
        status: 'active',
        location: ''
      });

      // Update local state
      const newMachine = { 
        id: supabaseMachine.id, 
        name: name.trim(), 
        lineId: selectedLine.id,
        created_at: supabaseMachine.created_at
      };
      setData((prev) => ({ ...prev, machines: [...prev.machines, newMachine] }));
    } catch (error) {
      console.error('Error creating machine:', error);
      alert('Failed to create machine. Please try again.');
    }
  };

  /** ----- Parts ----- **/
  const addPart = async () => {
    if (!selectedMachine) return;

    if (!newPart.name.trim()) {
      alert("Please enter Part Name");
      return;
    }

    // Prompt for minimum quantity
    const minQty = prompt(`Enter minimum quantity limit for "${newPart.name.trim()}":`, "1");
    if (minQty === null) return; // User cancelled
    
    const minQuantity = Number(minQty) || 0;
    if (minQuantity < 0) {
      alert("Minimum quantity cannot be negative");
      return;
    }

    try {
      // Create in Supabase
      const supabasePart = await createSupabasePart({
        name: newPart.name.trim(),
        part_number: newPart.partNumber.trim(),
        machine_id: selectedMachine.id,
        description: newPart.others.trim(),
        stock_quantity: Number(newPart.qty || 0),
        min_stock_level: minQuantity,
        location: newPart.location.trim(),
        cost: newPart.cost === "" ? null : Number(newPart.cost),
        last_checked: newPart.lastChecked || null,
        next_due: newPart.nextDue || null,
        others: newPart.others.trim()
      });

      // Update local state
      const payload = {
        id: supabasePart.id,
        machineId: selectedMachine.id,
        name: newPart.name.trim(),
        partNumber: newPart.partNumber.trim(),
        qty: Number(newPart.qty || 0),
        minQuantity: minQuantity,
        location: newPart.location.trim(),
        lastChecked: newPart.lastChecked || "",
        nextDue: newPart.nextDue || "",
        cost: newPart.cost === "" ? "" : Number(newPart.cost),
        others: newPart.others.trim(),
        lowStock: Number(newPart.qty || 0) < minQuantity,
      };

      setData((prev) => ({ ...prev, parts: [...prev.parts, payload] }));
      setNewPart({
        name: "",
        partNumber: "",
        qty: "",
        minQuantity: "",
        location: "",
        lastChecked: "",
        nextDue: "",
        cost: "",
        others: "",
      });
    } catch (error) {
      console.error('Error creating part:', error);
      alert('Failed to create part. Please try again.');
    }
  };

  const updatePart = async (id, field, value) => {
    try {
      // Update in Supabase
      const part = data.parts.find(p => p.id === id);
      if (part) {
        const updateData = {};
        switch (field) {
          case 'qty':
            updateData.stock_quantity = Number(value);
            break;
          case 'lastChecked':
            updateData.last_checked = value;
            break;
          case 'nextDue':
            updateData.next_due = value;
            break;
          case 'cost':
            updateData.cost = value === "" ? null : Number(value);
            break;
          default:
            break;
        }
        
        if (Object.keys(updateData).length > 0) {
          await updateSupabasePart(id, updateData);
        }
      }

      // Update local state
      setData((prev) => ({
        ...prev,
        parts: prev.parts.map((p) => {
          if (p.id === id) {
            const updatedPart = { ...p, [field]: value };
            // Recalculate low stock status when quantity changes
            if (field === 'qty') {
              updatedPart.lowStock = Number(value) < (p.minQuantity || 0);
            }
            return updatedPart;
          }
          return p;
        }),
      }));
    } catch (error) {
      console.error('Error updating part:', error);
      alert('Failed to update part. Please try again.');
    }
  };

  const deletePart = async (id) => {
    try {
      // Delete from Supabase
      await deleteSupabasePart(id);
      
      // Update local state
      setData((prev) => ({ ...prev, parts: prev.parts.filter((p) => p.id !== id) }));
    } catch (error) {
      console.error('Error deleting part:', error);
      alert('Failed to delete part. Please try again.');
    }
  };

  /** ----- Checkweighers CRUD ----- **/
  const addCheckweigher = async () => {
    if (!selectedLine) return;
    if (!newCW.name.trim()) {
      alert("Please enter Checkweigher name");
      return;
    }

    try {
      // Create in Supabase
      const supabaseCW = await createSupabaseCheckweigher({
        name: newCW.name.trim(),
        line_id: selectedLine.id,
        last_calibrated: newCW.lastCalibrated || null,
        next_due: newCW.nextDue || null
      });

      // Update local state
      const cw = {
        id: supabaseCW.id,
        lineId: selectedLine.id,
        name: newCW.name.trim(),
        lastCalibrated: newCW.lastCalibrated || "",
        nextDue: newCW.nextDue || "",
      };
      setData((prev) => ({ ...prev, checkweighers: [...prev.checkweighers, cw] }));
      setNewCW({ name: "", lastCalibrated: "", nextDue: "" });
    } catch (error) {
      console.error('Error creating checkweigher:', error);
      alert('Failed to create checkweigher. Please try again.');
    }
  };

  const updateCheckweigher = async (id, field, value) => {
    try {
      // Update in Supabase
      const updateData = {};
      switch (field) {
        case 'name':
          updateData.name = value;
          break;
        case 'lastCalibrated':
          updateData.last_calibrated = value;
          break;
        case 'nextDue':
          updateData.next_due = value;
          break;
        default:
          break;
      }
      
      if (Object.keys(updateData).length > 0) {
        await updateSupabaseCheckweigher(id, updateData);
      }

      // Update local state
      setData((prev) => ({
        ...prev,
        checkweighers: prev.checkweighers.map((c) =>
          c.id === id ? { ...c, [field]: value } : c
        ),
      }));
    } catch (error) {
      console.error('Error updating checkweigher:', error);
      alert('Failed to update checkweigher. Please try again.');
    }
  };

  const deleteCheckweigher = async (id) => {
    try {
      // Delete from Supabase
      await deleteSupabaseCheckweigher(id);
      
      // Update local state
      setData((prev) => ({
        ...prev,
        checkweighers: prev.checkweighers.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting checkweigher:', error);
      alert('Failed to delete checkweigher. Please try again.');
    }
  };

  // Error state
  if (error) {
    return (
      <div className="page-shell">
        <div className="container">
          <div className="card" style={{ maxWidth: 600, margin: "64px auto" }}>
            <h1 className="page-title" style={{ textAlign: "center", color: "#dc2626" }}>
              <Package size={28} className="title-icon" /> Database Connection Error
            </h1>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <p style={{ color: "#64748b", marginBottom: "16px" }}>
                Unable to connect to the database. Please check your Supabase configuration.
              </p>
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                Error: {error}
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button 
                onClick={() => window.location.reload()} 
                className="pill-btn primary"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="page-shell">
        <div className="container">
          <div className="card" style={{ maxWidth: 400, margin: "64px auto" }}>
            <h1 className="page-title" style={{ textAlign: "center" }}>
              <Package size={28} className="title-icon" /> Loading Inventory...
            </h1>
            <div style={{ textAlign: "center", color: "#64748b" }}>
              <p>Please wait while we load your inventory data from the database.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                        const isLowStock = part.lowStock || (part.qty < (part.minQuantity || 0));
                        return (
                          <tr key={part.id} className={`${idx % 2 ? "row-alt" : ""} ${isLowStock ? "low-stock-row" : ""}`}>
                            <td>
                              {highlight(part.name || "", globalSearchQuery)}
                              {isLowStock && <span className="low-stock-indicator">Low Stock</span>}
                            </td>
                            <td>{highlight(part.partNumber || "", globalSearchQuery)}</td>
                            <td>{machine?.name || 'Unknown'}</td>
                            <td>{line?.name || 'Unknown'}</td>
                            <td>{highlight(part.location || "", globalSearchQuery)}</td>
                            <td className={`td-center ${isLowStock ? "low-stock-qty" : ""}`}>{part.qty || 0}</td>
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

        {/* Global Aggregated Parts View */}
        <div className="card">
          <h2 className="card-title">
            📦 Aggregated Parts
            <button 
              onClick={() => setShowAggregatedParts(!showAggregatedParts)}
              className="pill-btn primary sm"
              style={{ marginLeft: '12px' }}
            >
              {showAggregatedParts ? 'Hide' : 'Show'} Aggregated View
            </button>
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
            View total quantities for parts with the same part number across all machines and lines
          </p>
          
          {showAggregatedParts && (
            <>
              <div className="search-row">
                <input
                  className="input"
                  placeholder="Search aggregated parts by name, part number, or location..."
                  value={aggregatedPartQuery}
                  onChange={(e) => setAggregatedPartQuery(e.target.value)}
                />
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Part Name</th>
                      <th>Part Number</th>
                      <th>Total Qty</th>
                      <th>Min Qty</th>
                      <th>Used In</th>
                      <th>Locations</th>
                      <th>Cost</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedPartsFiltered.map((part, idx) => {
                      const isLowStock = part.lowStock;
                      return (
                        <tr key={part.partNumber} className={`${idx % 2 ? "row-alt" : ""} ${isLowStock ? "low-stock-row" : ""}`}>
                          <td>
                            {highlight(part.name, aggregatedPartQuery)}
                            {isLowStock && <span className="low-stock-indicator">Low Stock</span>}
                          </td>
                          <td>{highlight(part.partNumber, aggregatedPartQuery)}</td>
                          <td className={`td-center ${isLowStock ? "low-stock-qty" : ""}`}>
                            {part.totalQty}
                          </td>
                          <td className="td-center">{part.minQuantity}</td>
                          <td>
                            <div style={{ fontSize: '12px' }}>
                              {part.machines.map(machineId => {
                                const machine = data.machines.find(m => m.id === machineId);
                                const line = machine ? data.lines.find(l => l.id === machine.lineId) : null;
                                return (
                                  <div key={machineId} style={{ marginBottom: '2px' }}>
                                    <strong>{machine?.name}</strong>
                                    {line && <span style={{ color: '#64748b' }}> ({line.name})</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px' }}>
                              {part.locations.map((loc, locIdx) => {
                                const machine = data.machines.find(m => m.id === loc.machineId);
                                return (
                                  <div key={locIdx} style={{ marginBottom: '2px' }}>
                                    <strong>{loc.qty}</strong> @ {highlight(loc.location, aggregatedPartQuery)}
                                    {machine && <span style={{ color: '#64748b' }}> ({machine.name})</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="td-center">{part.cost || '-'}</td>
                          <td className="td-center">
                            {isLowStock ? (
                              <span className="low-stock-indicator">Low Stock</span>
                            ) : (
                              <span style={{ color: '#16a34a', fontWeight: '600' }}>In Stock</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

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
            <button onClick={addLine} className="pill-btn is-action">
              <Plus size={16} /> Add Line
            </button>
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
                      {partsFiltered.map((p, idx) => {
                        const isLowStock = p.lowStock || (p.qty < (p.minQuantity || 0));
                        return (
                          <tr key={p.id} className={`${idx % 2 ? "row-alt" : ""} ${isLowStock ? "low-stock-row" : ""}`}>
                            <td>
                              {highlight(p.name || "", partQuery)}
                              {isLowStock && <span className="low-stock-indicator">Low Stock</span>}
                            </td>
                            <td>{highlight(p.partNumber || "", partQuery)}</td>
                            <td className="td-center">
                              <input
                                type="number"
                                value={p.qty ?? 0}
                                onChange={(e) => updatePart(p.id, "qty", Number(e.target.value))}
                                className={`input sm ${isLowStock ? "low-stock-qty" : ""}`}
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
                        );
                      })}

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
