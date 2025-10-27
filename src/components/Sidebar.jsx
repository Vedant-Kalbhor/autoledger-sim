// /simulation/src/components/Sidebar.jsx
import React from "react";

const Sidebar = ({ onSelect }) => {
  const actions = [
    { id: "mint", label: "🚗 Mint Vehicle" },
    { id: "garage", label: "🏭 Garage Registration" },
    { id: "service", label: "🧰 Add Service Record" },
    { id: "transfer", label: "🔁 Ownership Transfer" },
    { id: "lookup", label: "🔍 Vehicle History Lookup" },
  ];

  return (
    <div className="w-60 bg-white shadow-md border-r border-gray-200 p-4">
      <h2 className="text-lg font-bold mb-4">📊 Simulation Controls</h2>
      <div className="space-y-3">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

