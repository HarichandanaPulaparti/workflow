export interface Condition {
  id: string;
  label: string;
  expression: string;
}

export interface CustomNodeData {
  label?: string;
  collapsed?: boolean;
    toggleCollapse?: (id: string) => void; 

  config: {
  name?: string;
  source?: string;
  to?: string;
  timeout?: string;
  retries?: number;
  result?: string;
  status?: string;

  condition?: string; 
  conditions?: Condition[]; 

 
};

}
