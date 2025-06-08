import React from 'react';
import { Handle, Position } from 'reactflow';
import {
  Paper,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AltRouteIcon from '@mui/icons-material/AltRoute';

interface Condition {
  id: string;
  label: string;
  expression: string;
}

interface DecisionNodeProps {
  data: {
    label: string;
    toggleCollapse?: () => void;
    collapsed?: boolean;
    config?: {
      name?: string;
      condition?: string; // legacy
      conditions?: Condition[];
    };
  };
}

const DecisionNode: React.FC<DecisionNodeProps> = ({ data }) => {
  const conditions = data.config?.conditions || [];

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        minWidth: 200,
        backgroundColor: '#fafafa',
        border: '1px solid #e0e0e0',
        fontSize: 13,
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
          transition: '0.2s ease',
        },
      }}
    >
      {/* Header */}
      <Box
        px={1.5}
        py={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ backgroundColor: 'lightgray', borderBottom: '1px solid #e0e0e0' }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <AltRouteIcon fontSize="small" />
          <Typography fontSize={13} fontWeight={600}>
            {data.label || 'Decision'}
          </Typography>
        </Box>

        {data.toggleCollapse && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              data.toggleCollapse?.();
            }}
          >
            {data.collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        )}
      </Box>

      {/* Body */}
      <Box px={1.5} py={1}>
        {conditions.length > 0 ? (
          conditions.map((cond) => (
            <Typography key={cond.id} fontSize={12} color="text.secondary">
              {cond.label}: {cond.expression}
            </Typography>
          ))
        ) : (
          <Typography fontSize={12} color="text.secondary">
            {data.config?.condition || 'condition expression'}
          </Typography>
        )}
      </Box>

      <Handle type="target" position={Position.Top} />

      {conditions.map((cond, index) => (
        <Handle
          key={cond.id}
          id={cond.id}
          type="source"
          position={Position.Bottom}
          style={{
            left: `${((index + 1) / (conditions.length + 1)) * 100}%`,
            background: '#1976d2',
          }}
        />
      ))}
    </Paper>
  );
};

export default DecisionNode;
