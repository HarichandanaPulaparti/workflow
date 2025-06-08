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
  Typography,
} from '@mui/material';

const nodeTypes = {
  start: StartNode,
  action: ActionNode,
  decision: DecisionNode,
  terminal: TerminalNode,
};

const initialNodes: Node<CustomNodeData>[] = [
  {
    id: '1',
    type: 'start',
    data: {
      label: 'Start Node',
      config: { name: 'Webhook or Input' },
      collapsed: false,
    },
    position: { x: 250, y: 5 },
  },
  {
    id: '2',
    type: 'action',
    data: {
      label: 'Action Node',
      config: { name: 'Send Email', to: 'user@example.com' },
      collapsed: false,
    },
    position: { x: 250, y: 100 },
  },
  {
    id: '3',
    type: 'decision',
    data: {
      label: 'Decision Node?',
      config: {
        name: 'User Region?',
        conditions: [
          { id: 'usa', label: 'USA', expression: 'country === "US"' },
          { id: 'india', label: 'India', expression: 'country === "IN"' },
          { id: 'other', label: 'Other', expression: 'country !== "US" && country !== "IN"' }
        ]
      },
      collapsed: false,
    },
    position: { x: 250, y: 200 },
  },
  {
    id: '4',
    type: 'terminal',
    data: {
      label: 'Done',
      config: { name: 'Done', status: 'success' },
      collapsed: false,
    },
    position: { x: 250, y: 300 },
  },
  {
    id: '5',
    type: 'terminal',
    data: {
      label: 'Rejected',
      config: { name: 'Rejected', status: 'failure' },
      collapsed: false,
    },
    position: { x: 400, y: 300 },
  },
  {
    id: '6',
    type: 'terminal',
    data: { label: 'Route to USA Team', config: { name: 'US Route', status: 'end' }, collapsed: false },
    position: { x: 50, y: 300 },
  },
  {
    id: '7',
    type: 'terminal',
    data: { label: 'Route to India Team', config: { name: 'India Route', status: 'end' }, collapsed: false },
    position: { x: 250, y: 300 },
  },
  {
    id: '8',
    type: 'terminal',
    data: { label: 'Route to Others', config: { name: 'Other Route', status: 'end' }, collapsed: false },
    position: { x: 450, y: 300 },
  }
];

const initialEdges: CustomEdge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

const Flow: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>(initialEdges);
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

    const sourceNodeIndex = nodes.findIndex(n => n.id === selectedEdge.source);
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
      setNodes(prev => {
        const copy = [...prev];
        copy[sourceNodeIndex] = updatedNode;
        return copy;
      });
      setSelectedConditionId(newId);
    }

    const finalConditionId = selectedConditionId === '__new__' ? newConditionLabel.toLowerCase().replace(/\s+/g, '-') : selectedConditionId;
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

  const onNodeClick = (_event: React.MouseEvent, node: Node<CustomNodeData>) => {
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

  return (
    <div className="custom-grid-background">
      <ReactFlow
        nodes={nodes}
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
          addCopiedNode={() => {}}
        />
        <div style={{ position: 'absolute', top: 80, left: 20, background: '#ffffff', padding: '12px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 30 }}>
          <button style={buttonStyle}>+ Start Node</button>
          <button style={buttonStyle}>+ Action Node</button>
          <button style={buttonStyle}>+ Decision Node</button>
          <button style={buttonStyle}>+ Terminal Node</button>
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
              <TextField
                margin="dense"
                label="New Condition Label"
                fullWidth
                value={newConditionLabel}
                onChange={(e) => setNewConditionLabel(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Condition Expression"
                fullWidth
                value={newConditionExpression}
                onChange={(e) => setNewConditionExpression(e.target.value)}
              />
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
          <TextField
            autoFocus
            margin="dense"
            label="Edge Label"
            fullWidth
            variant="outlined"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
          />
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
