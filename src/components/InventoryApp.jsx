import React, { useState } from "react";
import { Plus, Trash2, Package, Layers, Wrench } from "lucide-react";

// Mock starting data
const initialData = {
  lines: [
    { id: 1, name: "Canning Line 1" },
    { id: 2, name: "Canning Line 2" },
    { id: 3, name: "Kegging Line" },
    { id: 4, name: "Bottling Line 1" },
    { id: 5, name: "Bottling Line 2" }
  ],
  machines: [
    { id: 1, name: "Depal", lineId: 2 },
    { id: 2, name: "Fibre King", lineId: 2 }
  ],
  parts: [
    {
      id: 1,
      name: "Proximity Switch Sensor",
      machineId: 2,
      quantity: 5,
      location: "Box 4",
      lastChecked: "2025-08-01",
      stockdale: "2025-09-01"
    }
  ]
};

export default function InventoryApp() {
  const [data, setData] = useState(initialData);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);

  const lines = data.lines;
  const machines = data.machines.filter((m) => m.lineId === selectedLine?.id);
  const parts = data.parts.filter((p) => p.machineId === selectedMachine?.id);

  const addMachine = () => {
    if (!selectedLine) return;
    const name = prompt("Enter machine name:");
    if (!name) return;
    const newMachine = { id: Date.now(), name, lineId: selectedLine.id };
    setData({ ...data, machines: [...data.machines, newMachine] });
  };

  const addPart = () => {
    if (!selectedMachine) return;
    const name = prompt("Enter part name:");
    if (!name) return;
    const newPart = {
      id: Date.now(),
      name,
      machineId: selectedMachine.id,
      quantity: 0,
      location: "",
      lastChecked: new Date().toISOString().slice(0, 10),
      stockdale: ""
    };
    setData({ ...data, parts: [...data.parts, newPart] });
  };

  const updatePart = (id, field, value) => {
    setData({
      ...data,
      parts: data.parts.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  const deletePart = (id) => {
    setData({ ...data, parts: data.parts.filter((p) => p.id !== id) });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Title */}
        <h1 className="text-3xl font-extrabold mb-4 flex items-center gap-2 text-slate-800">
          <Package className="w-8 h-8 text-indigo-600" /> Packaging Line Inventory
        </h1>

        {/* Line Selection */}
        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-xl font-bold mb-6 text-slate-700">Select a Line</h2>
          <div className="flex flex-wrap gap-4">
            {lines.map((line) => (
              <button
                key={line.id}
                onClick={() => {
                  setSelectedLine(line);
                  setSelectedMachine(null);
                }}
                className={`px-6 py-3 rounded-lg border shadow-md font-semibold text-lg transition ${
                  selectedLine?.id === line.id
                    ? "bg-indigo-600 text-white scale-105"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {line.name}
              </button>
            ))}
          </div>
        </div>

        {/* Machines */}
        {selectedLine && (
          <div className="bg-white p-6 shadow rounded-xl">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-700">
              <Layers className="w-5 h-5 text-blue-500" /> Machines in {selectedLine.name}
            </h2>
            <div className="flex flex-wrap gap-4">
              {machines.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMachine(m)}
                  className={`px-6 py-3 rounded-lg border shadow-md font-semibold text-lg transition ${
                    selectedMachine?.id === m.id
                      ? "bg-slate-800 text-white scale-105"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {m.name}
                </button>
              ))}
              <button
                onClick={addMachine}
                className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold flex items-center gap-2 hover:bg-green-700 transition"
              >
                <Plus className="w-5 h-5" /> Add Machine
              </button>
            </div>
          </div>
        )}

        {/* Parts */}
        {selectedMachine && (
          <div className="bg-white p-6 shadow rounded-xl">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-700">
              <Wrench className="w-5 h-5 text-purple-500" /> Parts for {selectedMachine.name}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded-xl overflow-hidden">
                <thead className="bg-slate-200 text-slate-700">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">Last Checked</th>
                    <th className="p-2">Stock Date</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((p, index) => (
                    <tr
                      key={p.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="p-2">{p.name}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={p.quantity}
                          onChange={(e) =>
                            updatePart(p.id, "quantity", Number(e.target.value))
                          }
                          className="w-16 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={p.location}
                          onChange={(e) =>
                            updatePart(p.id, "location", e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={p.lastChecked}
                          onChange={(e) =>
                            updatePart(p.id, "lastChecked", e.target.value)
                          }
                          className="px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={p.stockdale}
                          onChange={(e) =>
                            updatePart(p.id, "stockdale", e.target.value)
                          }
                          className="px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => deletePart(p.id)}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addPart}
              className="mt-4 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" /> Add Part
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
