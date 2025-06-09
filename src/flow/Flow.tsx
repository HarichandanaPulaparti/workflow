
import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './flow.css';
import StartNode from '../components/StartNode';
import ActionNode from '../components/ActionNode';
import DecisionNode from '../components/DecisionNode';
import TerminalNode from '../components/TerminalNode';
import NodeDrawer from '../components/NodeDrawer';
import { CustomNodeData } from '../types/CustomNodeData';
import { CustomEdge } from '../types/CustomEdge';
import {
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import initialData from '../initialdata.json';

const nodeTypes = {
  start: StartNode,
  action: ActionNode,
  decision: DecisionNode,
  terminal: TerminalNode,
};

const Flow: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>(initialData.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; edge: Edge | null } | null>(null);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [labelEdge, setLabelEdge] = useState<Edge | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [conditionDialogOpen, setConditionDialogOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<CustomEdge | null>(null);
  const [selectedConditionId, setSelectedConditionId] = useState('');
  const [newConditionLabel, setNewConditionLabel] = useState('');
  const [newConditionExpression, setNewConditionExpression] = useState('');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const getConditionLabel = (sourceId: string, conditionId: string): string => {
    const sourceNode = nodes.find((n) => n.id === sourceId);
    const conditions = sourceNode?.data?.config?.conditions || [];
    return conditions.find((c) => c.id === conditionId)?.label || conditionId;
  };

  const onConnect = useCallback((params: Edge | Connection) => {
    setSelectedEdge(params as CustomEdge);
    setConditionDialogOpen(true);
  }, []);

  const handleConditionSave = () => {
    if (!selectedEdge || !selectedConditionId) return;

    const sourceNodeIndex = nodes.findIndex((n) => n.id === selectedEdge.source);
    if (selectedConditionId === '__new__' && newConditionLabel && newConditionExpression && sourceNodeIndex !== -1) {
      const newId = newConditionLabel.toLowerCase().replace(/\s+/g, '-');
      const newCondition = { id: newId, label: newConditionLabel, expression: newConditionExpression };
      const updatedNode = { ...nodes[sourceNodeIndex] };
      updatedNode.data = {
        ...updatedNode.data,
        config: {
          ...updatedNode.data.config,
          conditions: [...(updatedNode.data.config.conditions || []), newCondition],
        },
      };
      setNodes((prev) => {
        const copy = [...prev];
        copy[sourceNodeIndex] = updatedNode;
        return copy;
      });
      setSelectedConditionId(newId);
    }

    const finalConditionId =
      selectedConditionId === '__new__'
        ? newConditionLabel.toLowerCase().replace(/\s+/g, '-')
        : selectedConditionId;
    const edgeId = `e${selectedEdge.source}-${selectedEdge.target}-${finalConditionId}`;

    const customEdge: CustomEdge = {
      id: edgeId,
      source: selectedEdge.source,
      target: selectedEdge.target,
      sourceHandle: finalConditionId,
      animated: true,
      conditionId: finalConditionId,
      label: getConditionLabel(selectedEdge.source, finalConditionId),
    };

    const updatedEdges = addEdge(customEdge as Edge, edges) as CustomEdge[];
    setEdges(updatedEdges);
    setConditionDialogOpen(false);
    setSelectedEdge(null);
    setSelectedConditionId('');
    setNewConditionLabel('');
    setNewConditionExpression('');
  };

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const currentLabel = typeof edge.label === 'string' ? edge.label : '';
    setLabelInput(currentLabel);
    setLabelEdge(edge);
    setLabelDialogOpen(true);
  }, []);

  const onEdgeContextMenu = (event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX + 2, mouseY: event.clientY - 6, edge });
  };

  const handleDeleteEdge = () => {
    if (!contextMenu?.edge) return;
    setEdges((eds) => eds.filter((e) => e.id !== contextMenu.edge!.id));
    setContextMenu(null);
  };

  const handleEditCondition = () => {
    if (contextMenu?.edge) {
      setSelectedEdge(contextMenu.edge as CustomEdge);
      setSelectedConditionId((contextMenu.edge as CustomEdge).conditionId || '');
      setConditionDialogOpen(true);
      setContextMenu(null);
    }
  };

const onNodeClick = (_: React.MouseEvent, node: Node<CustomNodeData>) => {
  setSelectedNodeId(node.id);
  setDrawerOpen(true);
};



  const handleLabelSave = () => {
    if (labelEdge) {
      setEdges((eds) => eds.map((e) => (e.id === labelEdge.id ? { ...e, label: labelInput } : e)));
    }
    setLabelDialogOpen(false);
    setLabelEdge(null);
  };

  const addCopiedNode = useCallback((originalNode: Node) => {
  const newId = (nodes.length + 1).toString();

  const newNode: Node = {
    id: newId,
    type: originalNode.type,
    position: {
      x: originalNode.position.x + 50,
      y: originalNode.position.y + 50,
    },
    data: {
      ...JSON.parse(JSON.stringify(originalNode.data)),
      id: newId, 
    },
  };

  setNodes((prev) => [...prev, newNode]);
}, [nodes, setNodes]);



  const toggleCollapse = useCallback((id: string) => {
  const toggledNode = nodes.find(n => n.id === id);
  if (!toggledNode) return;

  const isCollapsing = !toggledNode.data.collapsed;
  const descendants = findDescendants(id, edges);

  const updatedNodes = nodes.map(n => {
    if (n.id === id) {
      return {
        ...n,
        hidden: false,
        data: {
          ...n.data,
          collapsed: isCollapsing,
        },
      };
    }

    // Hide only subtree
    if (descendants.has(n.id)) {
      return {
        ...n,
        hidden: isCollapsing,
      };
    }

    return n;
  });

  const updatedEdges = edges.map(e => {
    const sourceHidden = descendants.has(e.source);
    const targetHidden = descendants.has(e.target);
    return {
      ...e,
      hidden: isCollapsing && (sourceHidden || targetHidden),
    };
  });

  setNodes(updatedNodes);
  setEdges(updatedEdges);
}, [nodes, edges]);



  const buttonStyle: React.CSSProperties = {
    background: '#f9f9f9',
    border: '1px solid #ddd',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    minWidth: '150px',
  };
  const collapsedNodeIds = new Set(
  nodes.filter((n) => n.data.collapsed).map((n) => n.id)
);
function getDescendants(
  nodeId: string,
  edges: Edge[]
): Set<string> {
  const visited = new Set<string>();
  const queue = [nodeId];

  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;

    for (const edge of edges) {
      if (edge.source === current && !visited.has(edge.target)) {
        visited.add(edge.target);
        queue.push(edge.target);
      }
    }
  }

  return visited;
}

const hiddenNodeIds = new Set<string>();
collapsedNodeIds.forEach((id) => {
  const descendants = getDescendants(id, edges);
  descendants.forEach((d) => hiddenNodeIds.add(d));
});

const visibleNodes = nodes.map((n) =>
  hiddenNodeIds.has(n.id)
    ? { ...n, hidden: true }
    : { ...n, hidden: false }
);

// const enhancedNodes = visibleNodes.map((node) => ({
//   ...node,
//   data: {
//     ...node.data,
//     toggleCollapse,
//     id: node.id,
//   },
// }));
const enhancedNodes = nodes.map((node) => ({
  ...node,
  hidden: hiddenNodeIds.has(node.id),
  data: {
    ...node.data,
    toggleCollapse,
    id: node.id,
  },
}));




const findDescendants = (rootId: string, edges: Edge[]): Set<string> => {
  const visited = new Set<string>();
  const stack = [rootId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const edge of edges) {
      if (edge.source === current && !visited.has(edge.target)) {
        visited.add(edge.target);
        stack.push(edge.target);
      }
    }
  }

  visited.delete(rootId); 
  return visited;
};
const getId = (() => {
  let id = nodes.length + 1;
  return () => `${id++}`;
})();
const addStartNode = () => {
  const newNode: Node<CustomNodeData> = {
    id: getId(),
    type: 'start',
    data: {
      label: 'New Start',
      config: { name: 'Webhook or Input' },
      collapsed: false,
    },
    position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
  };
  setNodes((nds) => [...nds, newNode]);
};

const addActionNode = () => {
  const newNode: Node<CustomNodeData> = {
    id: getId(),
    type: 'action',
    data: {
      label: 'New Action',
      config: { name: 'Send Email', to: 'someone@example.com' },
      collapsed: false,
    },
    position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
  };
  setNodes((nds) => [...nds, newNode]);
};

const addDecisionNode = () => {
  const newNode: Node<CustomNodeData> = {
    id: getId(),
    type: 'decision',
    data: {
      label: 'New Decision',
      config: {
        name: 'Decision?',
        conditions: [],
      },
      collapsed: false,
    },
    position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
  };
  setNodes((nds) => [...nds, newNode]);
};

const addTerminalNode = () => {
  const newNode: Node<CustomNodeData> = {
    id: getId(),
    type: 'terminal',
    data: {
      label: 'New Terminal',
      config: { status: 'success' },
      collapsed: false,
    },
    position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
  };
  setNodes((nds) => [...nds, newNode]);
};

const handleDownload = () => {
  const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workflow.json';
  a.click();
  URL.revokeObjectURL(url);
};

const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(event.target?.result as string);
      setNodes(loadedNodes);
      setEdges(loadedEdges);
    } catch (err) {
      alert('Invalid workflow file!');
    }
  };
  reader.readAsText(file);
};



  return (
    <div className="custom-grid-background">
      <ReactFlow
        nodes={enhancedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onEdgeContextMenu={onEdgeContextMenu}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <NodeDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          node={selectedNode}
          setNodes={setNodes}
          setEdges={setEdges}
          addCopiedNode={addCopiedNode}
          toggleCollapse={toggleCollapse}
        />
        <div style={{ position: 'absolute', top: 80, left: 20, background: '#ffffff', padding: '12px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 30 }}>
          <button style={buttonStyle} onClick={addStartNode}>+ Start Node</button>
  <button style={buttonStyle} onClick={addActionNode}>+ Action Node</button>
  <button style={buttonStyle} onClick={addDecisionNode}>+ Decision Node</button>
  <button style={buttonStyle} onClick={addTerminalNode}>+ Terminal Node</button>
  <button style={buttonStyle} onClick={handleDownload}>⬇️ Download Workflow</button>
<input type="file" accept=".json" onChange={handleUpload} style={{ marginTop: 8 }} />

        </div>
      </ReactFlow>

      <Dialog open={conditionDialogOpen} onClose={() => setConditionDialogOpen(false)}>
        <DialogTitle>Select Condition for Edge</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            select
            fullWidth
            label="Select Condition"
            value={selectedConditionId}
            onChange={(e) => setSelectedConditionId(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="" disabled>Select a condition</option>
            {(nodes.find((n) => n.id === selectedEdge?.source)?.data.config.conditions || []).map((cond) => (
              <option key={cond.id} value={cond.id}>{cond.label}</option>
            ))}
            <option value="__new__">➕ Add new condition...</option>
          </TextField>
          {selectedConditionId === '__new__' && (
            <>
              <TextField margin="dense" label="New Condition Label" fullWidth value={newConditionLabel} onChange={(e) => setNewConditionLabel(e.target.value)} />
              <TextField margin="dense" label="Condition Expression" fullWidth value={newConditionExpression} onChange={(e) => setNewConditionExpression(e.target.value)} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConditionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConditionSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={labelDialogOpen} onClose={() => setLabelDialogOpen(false)}>
        <DialogTitle>Edit Edge Label</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Edge Label" fullWidth variant="outlined" value={labelInput} onChange={(e) => setLabelInput(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLabelDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLabelSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
        slotProps={{ paper: { sx: { backgroundColor: '#f9f9f9', boxShadow: '0px 3px 12px rgba(0,0,0,0.1)', borderRadius: 2, padding: '4px 0' } } }}
      >
        <MenuItem onClick={handleEditCondition} sx={{ fontSize: 14, '&:hover': { backgroundColor: '#e3f2fd', color: '#1976d2' } }}>✏️ Change Condition</MenuItem>
        <MenuItem onClick={handleDeleteEdge} sx={{ fontSize: 14, '&:hover': { backgroundColor: '#fdecea', color: '#d32f2f' } }}>🗑️ Delete Edge</MenuItem>
      </Menu>
    </div>
  );
};

export default Flow;
