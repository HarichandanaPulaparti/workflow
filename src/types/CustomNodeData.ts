export interface Condition {
  id: string;
  label: string;
  expression: string;
}

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
  result?: string;
  status?: string;

  condition?: string; // for backward compatibility
  conditions?: Condition[]; // NEW

  // You can add more fields later as needed.
};

}
