import React from 'react';
import TopLevelUI from './components/TopLevelUI';

async function makeApp(wsUrl: string) {
  return (
    <div>
      <TopLevelUI wsUrl={wsUrl} />
      {/* <LoadFormHandler /> */}
    </div>
  );
}

function App() {
  return null
}

export default App;
