// /simulation/src/components/FlowCanvas.jsx
import React, { useEffect, useState, useRef } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";

/**
 * FlowCanvas v2
 * Improved version with detailed step explanations, bigger nodes,
 * and smooth animated transaction flow for presentation/demo.
 */

const COLORS = {
  highlight: "#16A34A", // emerald green
  edgeDefault: "#94A3B8", // slate gray
  nodeBg: "#ffffff",
  nodeHighlightBg: "#DCFCE7",
};

export default function FlowCanvas({ scenario }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stepInfo, setStepInfo] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);
  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  // Template for nodes & edges
  const nodeTemplate = (id, x, label) => ({
    id,
    position: { x, y: 150 },
    data: { label },
    style: {
      padding: 24,
      fontSize: 16,
      borderRadius: 10,
      border: "2px solid #E2E8F0",
      background: COLORS.nodeBg,
      minWidth: 240,
      textAlign: "center",
      fontWeight: 500,
    },
  });

  const edgeTemplate = (id, source, target, label) => ({
    id,
    source,
    target,
    label,
    animated: false,
    style: { stroke: COLORS.edgeDefault, strokeWidth: 3 },
    labelStyle: { fontSize: 13, fill: "#334155" },
  });

  // Define each scenario’s flow
  const buildBaseGraph = (key) => {
    switch (key) {
      case "mint":
        return {
          newNodes: [
            nodeTemplate("n1", 40, "👨‍💼 Admin"),
            nodeTemplate("n2", 360, "🧠 VehicleToken Smart Contract"),
            nodeTemplate("n3", 680, "⛓️ Blockchain Network"),
            nodeTemplate("n4", 1000, "💾 MongoDB (Vehicle Index)"),
          ],
          newEdges: [
            edgeTemplate("e1", "n1", "n2", "Mint Vehicle Tx"),
            edgeTemplate("e2", "n2", "n3", "Proof-of-Stake Validation"),
            edgeTemplate("e3", "n3", "n4", "Sync Metadata"),
          ],
          stepTexts: [
            "Admin initiates the minting transaction for a new vehicle NFT.",
            "Smart contract validates and submits transaction to blockchain.",
            "Blockchain confirms the transaction and updates MongoDB index.",
          ],
        };

      case "garage":
        return {
          newNodes: [
            nodeTemplate("n1", 40, "🏭 Garage"),
            nodeTemplate("n2", 360, "🧾 GarageRegistry Contract"),
            nodeTemplate("n3", 680, "⛓️ Blockchain"),
            nodeTemplate("n4", 1000, "✅ Admin Approval"),
          ],
          newEdges: [
            edgeTemplate("e1", "n1", "n2", "Submit KYC details"),
            edgeTemplate("e2", "n2", "n3", "Tx mined & verified"),
            edgeTemplate("e3", "n3", "n4", "Role granted by Admin"),
          ],
          stepTexts: [
            "Garage submits KYC information to the GarageRegistry contract.",
            "Transaction is mined and validated on the blockchain.",
            "Admin approves and assigns Garage role permissions.",
          ],
        };

      case "service":
        return {
          newNodes: [
            nodeTemplate("n1", 40, "🧰 Garage"),
            nodeTemplate("n2", 360, "🧠 ServiceRegistry Contract"),
            nodeTemplate("n3", 680, "⛓️ Blockchain"),
            nodeTemplate("n4", 1000, "💾 MongoDB (Service Record)"),
          ],
          newEdges: [
            edgeTemplate("e1", "n1", "n2", "Add Service Tx"),
            edgeTemplate("e2", "n2", "n3", "Block Added"),
            edgeTemplate("e3", "n3", "n4", "Sync DB"),
          ],
          stepTexts: [
            "Garage submits a service record to the contract.",
            "ServiceRegistry adds the record and writes it on-chain.",
            "Blockchain confirms, and MongoDB syncs off-chain copy.",
          ],
        };

      case "transfer":
        return {
          newNodes: [
            nodeTemplate("n1", 40, "👤 Seller"),
            nodeTemplate("n2", 360, "🧠 VehicleToken Contract"),
            nodeTemplate("n3", 680, "⛓️ Blockchain"),
            nodeTemplate("n4", 1000, "👤 Buyer"),
          ],
          newEdges: [
            edgeTemplate("e1", "n1", "n2", "Transfer Tx"),
            edgeTemplate("e2", "n2", "n3", "Consensus Validation"),
            edgeTemplate("e3", "n3", "n4", "Ownership Updated"),
          ],
          stepTexts: [
            "Seller initiates ownership transfer.",
            "Smart contract verifies transaction and consensus validation occurs.",
            "Ownership is updated on-chain and reflected for Buyer.",
          ],
        };

      case "lookup":
        return {
          newNodes: [
            nodeTemplate("n1", 40, "🔍 Public User"),
            nodeTemplate("n2", 360, "🧠 Contracts (Token + Service)"),
            nodeTemplate("n3", 680, "⛓️ Blockchain"),
            nodeTemplate("n4", 1000, "💾 MongoDB Cache"),
          ],
          newEdges: [
            edgeTemplate("e1", "n1", "n2", "Fetch request"),
            edgeTemplate("e2", "n2", "n3", "On-chain Read"),
            edgeTemplate("e3", "n3", "n4", "Display in UI"),
          ],
          stepTexts: [
            "User queries vehicle history from the app.",
            "Smart contracts fetch on-chain data.",
            "Results are displayed from MongoDB cache for faster load.",
          ],
        };

      default:
        return { newNodes: [], newEdges: [], stepTexts: [] };
    }
  };

  // 🎬 Animation Sequence
  const runAnimationSequence = (baseNodes, baseEdges, stepTexts) => {
    clearAllTimeouts();
    setNodes(baseNodes);
    setEdges(baseEdges);
    setStepInfo("");

    const delay = 4000;
    for (let step = 0; step < 3; step++) {
      const t = setTimeout(() => {
        setCurrentStep(step);
        setStepInfo(stepTexts[step]);

        // Highlight nodes + edges dynamically
        setEdges((prev) =>
          prev.map((e) =>
            e.id === `e${step + 1}`
              ? { ...e, animated: true, style: { ...e.style, stroke: COLORS.highlight, strokeWidth: 4 } }
              : e
          )
        );

        setNodes((prev) =>
          prev.map((n) =>
            (step === 0 && (n.id === "n1" || n.id === "n2")) ||
            (step === 1 && n.id === "n3") ||
            (step === 2 && n.id === "n4")
              ? { ...n, style: { ...n.style, background: COLORS.nodeHighlightBg, border: `3px solid ${COLORS.highlight}` } }
              : n
          )
        );
      }, step * delay);
      timeoutsRef.current.push(t);
    }
  };

  useEffect(() => {
    const { newNodes, newEdges, stepTexts } = buildBaseGraph(scenario);
    if (newNodes.length) runAnimationSequence(newNodes, newEdges, stepTexts);
    return () => clearAllTimeouts();
  }, [scenario]);

  return (
    <div style={{ flex: 1, position: "relative", height: "90vh" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          background: "white",
          padding: "10px 20px",
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          width: "80%",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#475569", fontSize: 15 }}>
          <b>Currently showing:</b> {scenario?.toUpperCase() || "—"} |{" "}
          <b>Step {currentStep + 1}/3</b>
        </p>
        <p style={{ fontSize: 14, color: "#334155", marginTop: 6 }}>
          {stepInfo || "Select a scenario to start the simulation."}
        </p>
      </motion.div>
    </div>
  );
}
