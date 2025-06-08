import React from 'react';
import { Handle, Position } from 'reactflow';
import { Paper, Typography, IconButton, Box } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

interface TerminalNodeProps {
  data: {
    label: string;
    toggleCollapse?: () => void;
    collapsed?: boolean;
    config?: { status?: string };
  };
}

const TerminalNode: React.FC<TerminalNodeProps> = ({ data }) => {
  const status = data.config?.status;
  const isSuccess = status === 'success';

  const StatusIcon = isSuccess ? CheckCircleRoundedIcon : CancelRoundedIcon;
  const statusColor = isSuccess ? '#2e7d32' : '#d32f2f';
  const statusLabel = status || 'Unknown';

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        minWidth: 180,
        backgroundColor: '#f5f5f5',
        border: '1px solid #e0e0e0',
        fontSize: 13,
        overflow: 'hidden',
        '&:hover': {
    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
    transition: '0.2s ease',
            }
      }}
    >
      {/* Header */}
      <Box
        px={1.5}
        py={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ backgroundColor: 'lightgray' }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <StatusIcon fontSize="small" sx={{ color: statusColor }} />
          <Typography fontSize={13} fontWeight={600}>
            {data.label}
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

      {/* Status Info */}
      <Box px={1.5} py={1}>
        <Typography fontSize={12} color="text.secondary">
          {statusLabel}
        </Typography>
      </Box>

      <Handle type="target" position={Position.Top} />
    </Paper>
  );
};

export default TerminalNode;
