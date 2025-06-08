// src/types/CustomNodeData.ts

export interface CustomNodeData {
  label?: string;
  collapsed?: boolean;
  toggleCollapse?: () => void;
  config: {
    name?: string;
    source?: string;
    to?: string;
    timeout?: string;
    retries?: number;
    condition?: string;
    result?: string;
    status?: string;
  };
}
