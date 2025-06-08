import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import { Node, Edge } from 'reactflow';

interface NodeDrawerProps {
  open: boolean;
  onClose: () => void;
  node: Node | null;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  addCopiedNode: (node: Node) => void;
}

const NodeDrawer: React.FC<NodeDrawerProps> = ({ open, onClose, node, setNodes, setEdges, addCopiedNode }) => {
  const [label, setLabel] = useState('');
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (node) {
      setLabel(node.data.label || '');
      setConfig(node.data.config || {});
    }
  }, [node]);

  const handleSave = () => {
    if (!node) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id ? { ...n, data: { ...n.data, label, config } } : n
      )
    );
    onClose();
  };

  const handleDelete = () => {
    if (!node) return;
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
    onClose();
  };

  const renderFieldsByType = () => {
    const type = node?.type;
    if (!type) return null;

    switch (type) {
      case 'start':
        return (
          <>
            <TextField
              label="Trigger Type"
              fullWidth
              margin="normal"
              value={config.triggerType || ''}
              onChange={(e) => setConfig({ ...config, triggerType: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              value={config.description || ''}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
            />
          </>
        );
      case 'action':
        return (
          <>
            <TextField
              label="Action Type"
              fullWidth
              margin="normal"
              value={config.actionType || ''}
              onChange={(e) => setConfig({ ...config, actionType: e.target.value })}
            />
            <TextField
              label="Inputs"
              fullWidth
              margin="normal"
              value={config.inputs || ''}
              onChange={(e) => setConfig({ ...config, inputs: e.target.value })}
            />
            <TextField
              label="Timeout"
              fullWidth
              margin="normal"
              value={config.timeout || ''}
              onChange={(e) => setConfig({ ...config, timeout: e.target.value })}
            />
            <TextField
              label="Retries"
              type="number"
              fullWidth
              margin="normal"
              value={config.retries || ''}
              onChange={(e) => setConfig({ ...config, retries: e.target.value })}
            />
          </>
        );
      case 'decision':
        return (
          <>
            <TextField
              label="Condition"
              fullWidth
              margin="normal"
              value={config.condition || ''}
              onChange={(e) => setConfig({ ...config, condition: e.target.value })}
            />
          </>
        );
      case 'terminal':
        return (
          <>
            <TextField
              label="Result"
              fullWidth
              margin="normal"
              value={config.result || ''}
              onChange={(e) => setConfig({ ...config, result: e.target.value })}
            />
            <TextField
              label="Log Message"
              fullWidth
              margin="normal"
              value={config.logMessage || ''}
              onChange={(e) => setConfig({ ...config, logMessage: e.target.value })}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 360, bgcolor: '#fefefe', boxShadow: 3 } }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Node Configuration
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <TextField
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Config Name"
            value={config.name || ''}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            fullWidth
            margin="normal"
          />

          {renderFieldsByType()}

          <Box display="flex" justifyContent="space-between" gap={1} mt={2}>
            <Button variant="outlined" onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#1976d2', color: '#fff' }}>
              Save
            </Button>
          </Box>
          <Box display="flex" justifyContent="space-between" flexDirection="column" gap={1} mt={2}>
            <Button color="error" variant="outlined" onClick={handleDelete}>Delete</Button>
            <Button variant="outlined" onClick={() => node && addCopiedNode(node)}>Copy Node</Button>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default NodeDrawer;
