// /simulation/src/components/FlowCanvas.jsx
import React, { useEffect, useState, useRef } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";

/**
 * FlowCanvas
 * - scenario prop: "mint" | "garage" | "service" | "transfer" | "lookup"
 * - renders nodes + edges and animates them in sequence when scenario changes
 */

const HIGHLIGHT_COLOR = "#10B981"; // green
const DEFAULT_EDGE_COLOR = "#A0AEC0"; // gray
const DEFAULT_NODE_BG = "#ffffff";
const HIGHLIGHT_NODE_BG = "#DCFCE7";

export default function FlowCanvas({ scenario }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const timeoutsRef = useRef([]);
  const [currentStep, setCurrentStep] = useState(-1);

  // Clear timeouts helper
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  // Build base nodes/edges for each scenario (no highlight)
  const buildBaseGraph = (scenarioKey) => {
    let newNodes = [];
    let newEdges = [];

    const nodeTemplate = (id, x, label) => ({
      id,
      position: { x, y: 120 },
      data: { label },
      style: {
        padding: 12,
        borderRadius: 8,
        border: "1px solid #E5E7EB",
        background: DEFAULT_NODE_BG,
        minWidth: 220,
        textAlign: "center"
      }
    });

    const edgeTemplate = (id, source, target, label) => ({
      id,
      source,
      target,
      label,
      animated: false,
      style: { stroke: DEFAULT_EDGE_COLOR, strokeWidth: 2 },
      labelStyle: { fontSize: 12, fill: "#475569" }
    });

    switch (scenarioKey) {
      case "mint":
        newNodes = [
          nodeTemplate("n1", 40, "👨‍💼 Admin (mint)"),
          nodeTemplate("n2", 360, "🧠 VehicleToken Contract"),
          nodeTemplate("n3", 680, "⛓️ Blockchain (PoS)"),
          nodeTemplate("n4", 1000, "💾 MongoDB (VehicleIndex)")
        ];
        newEdges = [
          edgeTemplate("e1", "n1", "n2", "Mint Vehicle Tx"),
          edgeTemplate("e2", "n2", "n3", "Proof-of-Stake Validation"),
          edgeTemplate("e3", "n3", "n4", "Sync metadata")
        ];
        break;

      case "garage":
        newNodes = [
          nodeTemplate("n1", 40, "🏭 Garage (apply)"),
          nodeTemplate("n2", 360, "🧾 GarageRegistry Contract"),
          nodeTemplate("n3", 680, "⛓️ Blockchain"),
          nodeTemplate("n4", 1000, "✅ Admin Approval")
        ];
        newEdges = [
          edgeTemplate("e1", "n1", "n2", "Submit KYC"),
          edgeTemplate("e2", "n2", "n3", " Tx mined & verified "),
          edgeTemplate("e3", "n3", "n4", "Role granted")
        ];
        break;

      case "service":
        newNodes = [
          nodeTemplate("n1", 40, "🧰 Garage (add record)"),
          nodeTemplate("n2", 360, "🧠 ServiceRegistry Contract"),
          nodeTemplate("n3", 680, "⛓️ Blockchain (PoS)"),
          nodeTemplate("n4", 1000, "💾 MongoDB (Record Cache)")
        ];
        newEdges = [
          edgeTemplate("e1", "n1", "n2", "Add Record Tx"),
          edgeTemplate("e2", "n2", "n3", "Block Added"),
          edgeTemplate("e3", "n3", "n4", "Sync off-chain DB")
        ];
        break;

      case "transfer":
        newNodes = [
          nodeTemplate("n1", 40, "👤 Seller"),
          nodeTemplate("n2", 360, "👤 Buyer"),
          nodeTemplate("n3", 680, "🧠 VehicleToken Contract"),
          nodeTemplate("n4", 1000, "⛓️ Blockchain Validation")
        ];
        newEdges = [
          edgeTemplate("e1", "n1", "n3", "Transfer Tx"),
          edgeTemplate("e2", "n3", "n4", "Consensus Validation"),
          edgeTemplate("e3", "n4", "n2", "Ownership Updated")
        ];
        break;

      case "lookup":
        newNodes = [
          nodeTemplate("n1", 40, "🔍 Public User"),
          nodeTemplate("n2", 360, "🔗 Contracts: Token + ServiceRegistry"),
          nodeTemplate("n3", 680, "⛓️ Blockchain Read"),
          nodeTemplate("n4", 1000, "💾 MongoDB Cache / UI")
        ];
        newEdges = [
          edgeTemplate("e1", "n1", "n2", "Fetch vehicle history"),
          edgeTemplate("e2", "n2", "n3", "On-chain read"),
          edgeTemplate("e3", "n3", "n4", "Show results in UI")
        ];
        break;

      default:
        break;
    }

    return { newNodes, newEdges };
  };

  // Highlight sequence runner:
  // step 0 -> highlight n1 & e1 & n2
  // step 1 -> highlight e2 & n3
  // step 2 -> highlight e3 & n4
  const runAnimationSequence = (baseNodes, baseEdges) => {
    clearAllTimeouts();
    setCurrentStep(-1);

    // start with base graph
    setNodes(baseNodes.map((n) => ({ ...n })));
    setEdges(baseEdges.map((e) => ({ ...e })));

    // sequence settings
    const stepDelay = 700; // ms between steps
    const totalSteps = 3;

    for (let step = 0; step < totalSteps; step++) {
      const t = setTimeout(() => {
        setCurrentStep(step);

        // compute highlighted nodes/edges for this step
        setEdges((prevEdges) =>
          prevEdges.map((edge, idx) => {
            // highlight e1 on step 0, e2 on step 1, e3 on step 2
            const highlightEdgeId = `e${step + 1}`;
            if (edge.id === highlightEdgeId) {
              return {
                ...edge,
                animated: true,
                style: { ...edge.style, stroke: HIGHLIGHT_COLOR, strokeWidth: 4 }
              };
            }
            // de-emphasize previously highlighted edges (but leave previously highlighted green)
            return edge;
          })
        );

        setNodes((prevNodes) =>
          prevNodes.map((node, idx) => {
            // mapping step -> nodes to highlight
            // step 0 -> highlight n1 and n2
            // step 1 -> highlight n3
            // step 2 -> highlight n4
            const toHighlight =
              (step === 0 && (node.id === "n1" || node.id === "n2")) ||
              (step === 1 && node.id === "n3") ||
              (step === 2 && node.id === "n4");

            if (toHighlight) {
              return {
                ...node,
                style: {
                  ...node.style,
                  background: HIGHLIGHT_NODE_BG,
                  border: `2px solid ${HIGHLIGHT_COLOR}`
                }
              };
            }
            return node;
          })
        );
      }, step * stepDelay);

      timeoutsRef.current.push(t);
    }

    // final cleanup / keep highlights visible for a while then reset to base graph after 3 seconds
    const resetTimeout = setTimeout(() => {
      // keep highlights for 1s then restore original base look
      setTimeout(() => {
        setNodes(baseNodes.map((n) => ({ ...n })));
        setEdges(baseEdges.map((e) => ({ ...e })));
        setCurrentStep(-1);
      }, 1000);
    }, totalSteps * stepDelay);

    timeoutsRef.current.push(resetTimeout);
  };

  // When scenario changes, rebuild graph and run animation
  useEffect(() => {
    clearAllTimeouts();
    const { newNodes, newEdges } = buildBaseGraph(scenario);
    if (newNodes.length && newEdges.length) {
      // small delay before starting animation for nicer UX
      const startTimeout = setTimeout(() => {
        runAnimationSequence(newNodes, newEdges);
      }, 200);
      timeoutsRef.current.push(startTimeout);
    } else {
      // empty scenario -> clear
      setNodes([]);
      setEdges([]);
    }

    // cleanup on scenario/unmount
    return () => clearAllTimeouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  // When component unmounts, clear timeouts
  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  // Container style ensures React Flow has width and height (fixes reactflow error #004)
  return (
    <div style={{ flex: 1, position: "relative", height: "100vh", overflow: "hidden" }}>
      <div style={{ width: "100%", height: "100%" }}>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "absolute",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          background: "white",
          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
          padding: "8px 14px",
          borderRadius: 10
        }}
      >
        <div style={{ color: "#475569", fontSize: 13 }}>
          Currently showing: <b style={{ textTransform: "capitalize" }}>{scenario || "—"}</b>
          {currentStep >= 0 && <span style={{ marginLeft: 12 }}>Step {currentStep + 1} / 3</span>}
        </div>
      </motion.div>
    </div>
  );
}
