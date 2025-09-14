import React, { useMemo, useState, useEffect } from "react";
import { Plus, Trash2, Package, Layers, Wrench, Scale } from "lucide-react";
import * as db from '../lib/database.js';

export default function InventoryAppSupabase({ globalSearchQuery }) {
  // State management
  const [lines, setLines] = useState([]);
  const [machines, setMachines] = useState([]);
  const [parts, setParts] = useState([]);
  const [checkweighers, setCheckweighers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showAddLine, setShowAddLine] = useState(false);
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);
  const [showAddCheckweigher, setShowAddCheckweigher] = useState(false);
  const [showAggregatedParts, setShowAggregatedParts] = useState(false);
  const [aggregatedPartQuery, setAggregatedPartQuery] = useState("");

  // Form states
  const [newLine, setNewLine] = useState({ name: "" });
  const [newMachine, setNewMachine] = useState({ name: "" });
  const [newPart, setNewPart] = useState({ 
    partNumber: "", 
    description: "", 
    quantity: 0, 
    minQuantity: 0 
  });
  const [newCheckweigher, setNewCheckweigher] = useState({ name: "" });

  // Load data from Supabase on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [linesData, machinesData, partsData, checkweighersData] = await Promise.all([
        db.getLines(),
        db.getMachines(),
        db.getParts(),
        db.getCheckweighers()
      ]);

      setLines(linesData);
      setMachines(machinesData);
      setParts(partsData);
      setCheckweighers(checkweighersData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Global search functionality
  const globalSearch = useMemo(() => {
    if (!globalSearchQuery) return { lines: [], machines: [], parts: [], checkweighers: [] };
    
    const query = globalSearchQuery.toLowerCase();
    return {
      lines: lines.filter(line => line.name.toLowerCase().includes(query)),
      machines: machines.filter(machine => machine.name.toLowerCase().includes(query)),
      parts: parts.filter(part => 
        part.part_number?.toLowerCase().includes(query) || 
        part.description?.toLowerCase().includes(query)
      ),
      checkweighers: checkweighers.filter(cw => cw.name.toLowerCase().includes(query))
    };
  }, [globalSearchQuery, lines, machines, parts, checkweighers]);

  // Filter machines and parts based on selection and global search
  const machinesFiltered = useMemo(() => {
    let filtered = machines;
    
    if (selectedLine) {
      filtered = filtered.filter(machine => machine.line_id === selectedLine.id);
    }
    
    if (globalSearchQuery) {
      filtered = filtered.filter(machine => 
        globalSearch.machines.some(searchMachine => searchMachine.id === machine.id)
      );
    }
    
    return filtered;
  }, [machines, selectedLine, globalSearchQuery, globalSearch.machines]);

  const partsFiltered = useMemo(() => {
    let filtered = parts;
    
    if (selectedMachine) {
      filtered = filtered.filter(part => part.machine_id === selectedMachine.id);
    }
    
    if (globalSearchQuery) {
      filtered = filtered.filter(part => 
        globalSearch.parts.some(searchPart => searchPart.id === part.id)
      );
    }
    
    return filtered;
  }, [parts, selectedMachine, globalSearchQuery, globalSearch.parts]);

  // Aggregated parts functionality
  const aggregatedParts = useMemo(() => {
    const partMap = new Map();
    
    parts.forEach(part => {
      const key = part.part_number;
      if (!partMap.has(key)) {
        partMap.set(key, {
          partNumber: part.part_number,
          description: part.description,
          totalQty: 0,
          minQuantity: part.min_quantity || 0,
          machines: [],
          lines: []
        });
      }
      
      const aggregated = partMap.get(key);
      aggregated.totalQty += part.quantity || 0;
      aggregated.minQuantity = Math.max(aggregated.minQuantity, part.min_quantity || 0);
      
      // Find machine and line info
      const machine = machines.find(m => m.id === part.machine_id);
      if (machine) {
        aggregated.machines.push(machine.name);
        const line = lines.find(l => l.id === machine.line_id);
        if (line) {
          aggregated.lines.push(line.name);
        }
      }
    });
    
    return Array.from(partMap.values());
  }, [parts, machines, lines]);

  const aggregatedPartsFiltered = useMemo(() => {
    if (!aggregatedPartQuery) return aggregatedParts;
    
    const query = aggregatedPartQuery.toLowerCase();
    return aggregatedParts.filter(part => 
      part.partNumber.toLowerCase().includes(query) ||
      part.description?.toLowerCase().includes(query)
    );
  }, [aggregatedParts, aggregatedPartQuery]);

  // CRUD Operations
  const addLine = async () => {
    if (!newLine.name.trim()) return;
    
    try {
      const lineData = await db.addLine({ name: newLine.name.trim() });
      setLines(prev => [...prev, lineData]);
      setNewLine({ name: "" });
      setShowAddLine(false);
    } catch (err) {
      console.error('Error adding line:', err);
      setError('Failed to add line. Please try again.');
    }
  };

  const addMachine = async () => {
    if (!newMachine.name.trim() || !selectedLine) return;
    
    try {
      const machineData = await db.addMachine({ 
        name: newMachine.name.trim(),
        line_id: selectedLine.id
      });
      setMachines(prev => [...prev, machineData]);
      setNewMachine({ name: "" });
      setShowAddMachine(false);
    } catch (err) {
      console.error('Error adding machine:', err);
      setError('Failed to add machine. Please try again.');
    }
  };

  const addPart = async () => {
    if (!newPart.partNumber.trim() || !selectedMachine) return;
    
    try {
      const partData = await db.addPart({
        part_number: newPart.partNumber.trim(),
        description: newPart.description.trim(),
        quantity: parseInt(newPart.quantity) || 0,
        min_quantity: parseInt(newPart.minQuantity) || 0,
        machine_id: selectedMachine.id,
        low_stock: (parseInt(newPart.quantity) || 0) < (parseInt(newPart.minQuantity) || 0)
      });
      
      setParts(prev => [...prev, partData]);
      setNewPart({ partNumber: "", description: "", quantity: 0, minQuantity: 0 });
      setShowAddPart(false);
    } catch (err) {
      console.error('Error adding part:', err);
      setError('Failed to add part. Please try again.');
    }
  };

  const addCheckweigher = async () => {
    if (!newCheckweigher.name.trim() || !selectedLine) return;
    
    try {
      const checkweigherData = await db.addCheckweigher({
        name: newCheckweigher.name.trim(),
        line_id: selectedLine.id
      });
      setCheckweighers(prev => [...prev, checkweigherData]);
      setNewCheckweigher({ name: "" });
      setShowAddCheckweigher(false);
    } catch (err) {
      console.error('Error adding checkweigher:', err);
      setError('Failed to add checkweigher. Please try again.');
    }
  };

  const updatePart = async (partId, updates) => {
    try {
      const updatedPart = await db.updatePart(partId, updates);
      setParts(prev => prev.map(part => 
        part.id === partId ? updatedPart : part
      ));
    } catch (err) {
      console.error('Error updating part:', err);
      setError('Failed to update part. Please try again.');
    }
  };

  const deleteLine = async (lineId) => {
    if (!confirm('Are you sure you want to delete this line? This will also delete all associated machines and parts.')) return;
    
    try {
      await db.deleteLine(lineId);
      setLines(prev => prev.filter(line => line.id !== lineId));
      setMachines(prev => prev.filter(machine => machine.line_id !== lineId));
      setParts(prev => prev.filter(part => {
        const machine = machines.find(m => m.id === part.machine_id);
        return machine && machine.line_id !== lineId;
      }));
      setCheckweighers(prev => prev.filter(cw => cw.line_id !== lineId));
      
      if (selectedLine?.id === lineId) {
        setSelectedLine(null);
        setSelectedMachine(null);
      }
    } catch (err) {
      console.error('Error deleting line:', err);
      setError('Failed to delete line. Please try again.');
    }
  };

  const deleteMachine = async (machineId) => {
    if (!confirm('Are you sure you want to delete this machine? This will also delete all associated parts.')) return;
    
    try {
      await db.deleteMachine(machineId);
      setMachines(prev => prev.filter(machine => machine.id !== machineId));
      setParts(prev => prev.filter(part => part.machine_id !== machineId));
      
      if (selectedMachine?.id === machineId) {
        setSelectedMachine(null);
      }
    } catch (err) {
      console.error('Error deleting machine:', err);
      setError('Failed to delete machine. Please try again.');
    }
  };

  const deletePart = async (partId) => {
    if (!confirm('Are you sure you want to delete this part?')) return;
    
    try {
      await db.deletePart(partId);
      setParts(prev => prev.filter(part => part.id !== partId));
    } catch (err) {
      console.error('Error deleting part:', err);
      setError('Failed to delete part. Please try again.');
    }
  };

  const deleteCheckweigher = async (checkweigherId) => {
    if (!confirm('Are you sure you want to delete this checkweigher?')) return;
    
    try {
      await db.deleteCheckweigher(checkweigherId);
      setCheckweighers(prev => prev.filter(cw => cw.id !== checkweigherId));
    } catch (err) {
      console.error('Error deleting checkweigher:', err);
      setError('Failed to delete checkweigher. Please try again.');
    }
  };

  // Helper function to check if part is low stock
  const isLowStock = (part) => {
    return part.quantity < part.min_quantity;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadAllData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-app">
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Global Search Results */}
      {globalSearchQuery && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🔍 Global Search Results</h3>
          
          {globalSearch.lines.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-blue-700">Lines ({globalSearch.lines.length})</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {globalSearch.lines.map(line => (
                  <span key={line.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {line.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {globalSearch.machines.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-blue-700">Machines ({globalSearch.machines.length})</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {globalSearch.machines.map(machine => (
                  <span key={machine.id} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {machine.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {globalSearch.parts.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-blue-700">Parts ({globalSearch.parts.length})</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {globalSearch.parts.map(part => (
                  <span key={part.id} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                    {part.part_number}
                  </span>
                ))}
              </div>
            </div>
          )}

          {globalSearch.checkweighers.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-blue-700">Checkweighers ({globalSearch.checkweighers.length})</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {globalSearch.checkweighers.map(cw => (
                  <span key={cw.id} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                    {cw.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {globalSearch.lines.length === 0 && globalSearch.machines.length === 0 && 
           globalSearch.parts.length === 0 && globalSearch.checkweighers.length === 0 && (
            <p className="text-gray-600">No results found for "{globalSearchQuery}"</p>
          )}
        </div>
      )}

      {/* Rest of your existing component JSX would go here */}
      {/* I'll continue with the rest of the component structure... */}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lines Column */}
        <div className="card">
          <div className="card-title">
            <Layers className="sub-icon" />
            Packaging Lines
          </div>
          
          <div className="space-y-2">
            {lines.map(line => (
              <div
                key={line.id}
                className={`pill-btn ${selectedLine?.id === line.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedLine(line);
                  setSelectedMachine(null);
                }}
              >
                {line.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLine(line.id);
                  }}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            {showAddLine ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLine.name}
                  onChange={(e) => setNewLine({ name: e.target.value })}
                  placeholder="Line name"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addLine()}
                  autoFocus
                />
                <button onClick={addLine} className="pill-btn primary">
                  <Plus size={16} />
                </button>
                <button onClick={() => setShowAddLine(false)} className="pill-btn">
                  ✕
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAddLine(true)} className="pill-btn">
                <Plus size={16} />
                Add Line
              </button>
            )}
          </div>
        </div>

        {/* Machines Column */}
        <div className="card">
          <div className="card-title">
            <Wrench className="sub-icon" />
            {selectedLine ? `Machines - ${selectedLine.name}` : 'Select a Line'}
          </div>
          
          {selectedLine && (
            <div className="space-y-2">
              {machinesFiltered.map(machine => (
                <div
                  key={machine.id}
                  className={`pill-btn ${selectedMachine?.id === machine.id ? 'active' : ''}`}
                  onClick={() => setSelectedMachine(machine)}
                >
                  {machine.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMachine(machine.id);
                    }}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              
              {showAddMachine ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMachine.name}
                    onChange={(e) => setNewMachine({ name: e.target.value })}
                    placeholder="Machine name"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addMachine()}
                    autoFocus
                  />
                  <button onClick={addMachine} className="pill-btn primary">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => setShowAddMachine(false)} className="pill-btn">
                    ✕
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAddMachine(true)} className="pill-btn">
                  <Plus size={16} />
                  Add Machine
                </button>
              )}
            </div>
          )}
        </div>

        {/* Parts Column */}
        <div className="card">
          <div className="card-title">
            <Package className="sub-icon" />
            {selectedMachine ? `Parts - ${selectedMachine.name}` : 'Select a Machine'}
          </div>
          
          {selectedMachine && (
            <div className="space-y-2">
              {partsFiltered.map(part => (
                <div
                  key={part.id}
                  className={`pill-btn ${isLowStock(part) ? 'low-stock-row' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-medium">{part.part_number}</div>
                      {part.description && (
                        <div className="text-xs text-gray-600">{part.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isLowStock(part) ? 'low-stock-qty' : ''}`}>
                        QTY: {part.quantity}
                      </span>
                      {isLowStock(part) && (
                        <span className="low-stock-indicator">Low Stock</span>
                      )}
                      <button
                        onClick={() => deletePart(part.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {showAddPart ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newPart.partNumber}
                    onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })}
                    placeholder="Part number"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={newPart.description}
                    onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                    placeholder="Description"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newPart.quantity}
                      onChange={(e) => setNewPart({ ...newPart, quantity: e.target.value })}
                      placeholder="Quantity"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      value={newPart.minQuantity}
                      onChange={(e) => setNewPart({ ...newPart, minQuantity: e.target.value })}
                      placeholder="Min Qty"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addPart} className="pill-btn primary flex-1">
                      <Plus size={16} />
                      Add Part
                    </button>
                    <button onClick={() => setShowAddPart(false)} className="pill-btn">
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddPart(true)} className="pill-btn">
                  <Plus size={16} />
                  Add Part
                </button>
              )}
            </div>
          )}
        </div>

        {/* Checkweighers Column */}
        <div className="card">
          <div className="card-title">
            <Scale className="sub-icon" />
            {selectedLine ? `Checkweighers - ${selectedLine.name}` : 'Select a Line'}
          </div>
          
          {selectedLine && (
            <div className="space-y-2">
              {checkweighers.filter(cw => cw.line_id === selectedLine.id).map(checkweigher => (
                <div key={checkweigher.id} className="pill-btn">
                  <div className="flex items-center justify-between w-full">
                    <span>{checkweigher.name}</span>
                    <button
                      onClick={() => deleteCheckweigher(checkweigher.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              {showAddCheckweigher ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCheckweigher.name}
                    onChange={(e) => setNewCheckweigher({ name: e.target.value })}
                    placeholder="Checkweigher name"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addCheckweigher()}
                    autoFocus
                  />
                  <button onClick={addCheckweigher} className="pill-btn primary">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => setShowAddCheckweigher(false)} className="pill-btn">
                    ✕
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAddCheckweigher(true)} className="pill-btn">
                  <Plus size={16} />
                  Add Checkweigher
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Aggregated Parts View */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">📦 Aggregated Parts</h2>
          <button
            onClick={() => setShowAggregatedParts(!showAggregatedParts)}
            className="pill-btn"
          >
            {showAggregatedParts ? 'Hide' : 'Show'} Aggregated View
          </button>
        </div>

        {showAggregatedParts && (
          <div className="card">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search aggregated parts..."
                value={aggregatedPartQuery}
                onChange={(e) => setAggregatedPartQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Part Number</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Total Quantity</th>
                    <th className="text-left py-2">Min Quantity</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Machines</th>
                    <th className="text-left py-2">Lines</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedPartsFiltered.map((part, index) => (
                    <tr key={index} className={part.totalQty < part.minQuantity ? 'low-stock-row' : ''}>
                      <td className="py-2 font-medium">{part.partNumber}</td>
                      <td className="py-2">{part.description || '-'}</td>
                      <td className={`py-2 font-bold ${part.totalQty < part.minQuantity ? 'low-stock-qty' : ''}`}>
                        {part.totalQty}
                      </td>
                      <td className="py-2">{part.minQuantity}</td>
                      <td className="py-2">
                        {part.totalQty < part.minQuantity && (
                          <span className="low-stock-indicator">Low Stock</span>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(part.machines)].map((machine, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {machine}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(part.lines)].map((line, i) => (
                            <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {line}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
