import React, { useMemo, useState, useEffect } from "react";
import { Plus, Trash2, Package, Layers, Wrench, Scale } from "lucide-react";
import { useInventory } from '../hooks/useInventory.js';

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

export default function InventoryAppWithSupabase({ globalSearchQuery }) {
  // Use the Supabase inventory hook
  const {
    parts,
    machines,
    lines,
    checkweighers,
    loading,
    error,
    createPart,
    updatePart,
    deletePart,
    createMachine,
    updateMachine,
    deleteMachine,
    createLine,
    updateLine,
    deleteLine,
    createCheckweigher,
    updateCheckweigher,
    deleteCheckweigher,
    globalSearch
  } = useInventory();

  // Local state for UI
  const [activeTab, setActiveTab] = useState("lines");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  // Handle global search
  useEffect(() => {
    if (globalSearchQuery && globalSearchQuery.trim()) {
      handleGlobalSearch(globalSearchQuery);
    } else {
      setSearchResults(null);
    }
  }, [globalSearchQuery]);

  const handleGlobalSearch = async (query) => {
    try {
      const results = await globalSearch(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Sort machines for Canning Line 2
  const sortedMachines = useMemo(() => {
    if (!machines) return [];
    
    return machines.sort((a, b) => {
      const aIndex = cl2Order.indexOf(a.name);
      const bIndex = cl2Order.indexOf(b.name);
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      return aIndex - bIndex;
    });
  }, [machines]);

  // Group machines by line
  const machinesByLine = useMemo(() => {
    if (!machines || !lines) return {};
    
    const grouped = {};
    lines.forEach(line => {
      grouped[line.id] = machines.filter(machine => machine.line_id === line.id);
    });
    return grouped;
  }, [machines, lines]);

  // Filter data based on search results
  const getFilteredData = (data, type) => {
    if (!searchResults) return data;
    return searchResults[type] || [];
  };

  const filteredLines = getFilteredData(lines, 'lines');
  const filteredMachines = getFilteredData(machines, 'machines');
  const filteredParts = getFilteredData(parts, 'parts');
  const filteredCheckweighers = getFilteredData(checkweighers, 'checkweighers');

  // Render functions for each tab
  const renderLines = () => (
    <div className="space-y-4">
      {filteredLines.map((line) => (
        <div key={line.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{line.name}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingItem({ type: 'line', data: line })}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => deleteLine(line.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{line.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span> {line.status}
            </div>
            <div>
              <span className="font-medium">Location:</span> {line.location}
            </div>
            <div>
              <span className="font-medium">Capacity:</span> {line.capacity}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMachines = () => (
    <div className="space-y-4">
      {filteredMachines.map((machine) => (
        <div key={machine.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{machine.name}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingItem({ type: 'machine', data: machine })}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => deleteMachine(machine.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Model:</span> {machine.model}
            </div>
            <div>
              <span className="font-medium">Manufacturer:</span> {machine.manufacturer}
            </div>
            <div>
              <span className="font-medium">Serial Number:</span> {machine.serial_number}
            </div>
            <div>
              <span className="font-medium">Status:</span> {machine.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderParts = () => (
    <div className="space-y-4">
      {filteredParts.map((part) => (
        <div key={part.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{part.name}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingItem({ type: 'part', data: part })}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => deletePart(part.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <span className="font-medium">Part Number:</span> {part.part_number}
            </div>
            <div>
              <span className="font-medium">Category:</span> {part.category}
            </div>
            <div>
              <span className="font-medium">Manufacturer:</span> {part.manufacturer}
            </div>
            <div>
              <span className="font-medium">Stock:</span> {part.stock_quantity}
            </div>
            <div>
              <span className="font-medium">Min Level:</span> {part.min_stock_level}
            </div>
            <div>
              <span className="font-medium">Cost:</span> ${part.cost}
            </div>
          </div>
          <p className="text-gray-600">{part.description}</p>
        </div>
      ))}
    </div>
  );

  const renderCheckweighers = () => (
    <div className="space-y-4">
      {filteredCheckweighers.map((checkweigher) => (
        <div key={checkweigher.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{checkweigher.name}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingItem({ type: 'checkweigher', data: checkweigher })}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCheckweigher(checkweigher.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Model:</span> {checkweigher.model}
            </div>
            <div>
              <span className="font-medium">Manufacturer:</span> {checkweigher.manufacturer}
            </div>
            <div>
              <span className="font-medium">Accuracy:</span> {checkweigher.accuracy}
            </div>
            <div>
              <span className="font-medium">Max Weight:</span> {checkweigher.max_weight}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading inventory data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
        <br />
        <small>Please check your Supabase configuration and try again.</small>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Search Results Header */}
      {searchResults && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Search Results for "{globalSearchQuery}"
          </h2>
          <div className="text-sm text-blue-600">
            Found: {searchResults.parts.length} parts, {searchResults.machines.length} machines, 
            {searchResults.lines.length} lines, {searchResults.checkweighers.length} checkweighers
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "lines", label: "Lines", icon: Layers, count: filteredLines.length },
          { id: "machines", label: "Machines", icon: Wrench, count: filteredMachines.length },
          { id: "parts", label: "Parts", icon: Package, count: filteredParts.length },
          { id: "checkweighers", label: "Checkweighers", icon: Scale, count: filteredCheckweighers.length },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Add {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {activeTab === "lines" && renderLines()}
        {activeTab === "machines" && renderMachines()}
        {activeTab === "parts" && renderParts()}
        {activeTab === "checkweighers" && renderCheckweighers()}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? `Edit ${editingItem.type}` : `Add ${activeTab.slice(0, -1)}`}
            </h3>
            <p className="text-gray-600 mb-4">
              Form implementation would go here. This is a placeholder for the add/edit functionality.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
