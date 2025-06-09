import { Edge } from 'reactflow';
import { ReactNode } from 'react';

export type CustomEdge = Edge & {
  label?: string | ReactNode;
  conditionId?: string; 
};
