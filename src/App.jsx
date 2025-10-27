// /simulation/src/App.jsx
import React, { useState } from "react";
import FlowCanvas from "./components/FlowCanvas";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [scenario, setScenario] = useState("mint");

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onSelect={setScenario} />
      <FlowCanvas scenario={scenario} />
      {/* <button
      onClick={() => setScenario("mint")}
      className="px-6 py-3 text-lg bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
    >
      🚗 Mint Vehicle
    </button> */}

    </div>
  );
}
