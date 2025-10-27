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
    </div>
  );
}
