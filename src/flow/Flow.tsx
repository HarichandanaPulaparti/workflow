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
import { Menu, MenuItem, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';

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
      config: { name: 'User Verified?', condition: 'isVerified == true' },
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
];

const initialEdges: CustomEdge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4-yes', source: '3', sourceHandle: 'yes', target: '4', animated: true, label: 'Yes' },
  { id: 'e3-5-no', source: '3', sourceHandle: 'no', target: '5', animated: true, label: 'No' },
];

const Flow: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    edge: Edge | null;
  } | null>(null);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [labelEdge, setLabelEdge] = useState<Edge | null>(null);
  const [labelInput, setLabelInput] = useState('');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const currentLabel = typeof edge.label === 'string' ? edge.label : '';
      setLabelInput(currentLabel);
      setLabelEdge(edge);
      setLabelDialogOpen(true);
    },
    []
  );

  const onEdgeContextMenu = (event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      edge,
    });
  };

  const handleDeleteEdge = () => {
    if (!contextMenu?.edge) return;
    setEdges((eds) => eds.filter((e) => e.id !== contextMenu.edge!.id));
    setContextMenu(null);
  };

  const onNodeClick = (_event: React.MouseEvent, node: Node<CustomNodeData>) => {
    setSelectedNodeId(node.id);
    setDrawerOpen(true);
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

  const handleLabelSave = () => {
    if (labelEdge) {
      setEdges((eds) => eds.map((e) => (e.id === labelEdge.id ? { ...e, label: labelInput } : e)));
    }
    setLabelDialogOpen(false);
    setLabelEdge(null);
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
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 20,
            background: '#ffffff',
            padding: '12px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 30,
          }}
        >
          <button style={buttonStyle} onClick={() => {}}>+ Start Node</button>
          <button style={buttonStyle} onClick={() => {}}>+ Action Node</button>
          <button style={buttonStyle} onClick={() => {}}>+ Decision Node</button>
          <button style={buttonStyle} onClick={() => {}}>+ Terminal Node</button>
        </div>
      </ReactFlow>
          <Dialog
  open={labelDialogOpen}
  onClose={() => setLabelDialogOpen(false)}
  PaperProps={{
    sx: {
      borderRadius: 3,
      padding: 2,
      width: 400,
      backgroundColor: '#fdfcff',
      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
    },
  }}
>
  <DialogTitle sx={{ fontWeight: 600 }}>✏️ Edit Edge Label</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      fullWidth
      variant="outlined"
      label="Label"
      value={labelInput}
      onChange={(e) => setLabelInput(e.target.value)}
      sx={{
        marginTop: 2,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        },
      }}
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
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#f9f9f9',
              boxShadow: '0px 3px 12px rgba(0,0,0,0.1)',
              borderRadius: 2,
              padding: '4px 0',
            },
          },
        }}
      >
        <MenuItem
          onClick={handleDeleteEdge}
          sx={{
            fontSize: 14,
            '&:hover': {
              backgroundColor: '#fdecea',
              color: '#d32f2f',
            },
          }}
        >
          🗑️ Delete Edge
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Flow;
