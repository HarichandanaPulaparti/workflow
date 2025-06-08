import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import Flow from './flow/Flow'
const App: React.FC = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default App;
