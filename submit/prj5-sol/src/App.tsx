import React from 'react';
import Spreadsheet from './components/Spreadsheet';
import SpreadsheetWs from './ss-ws';



function App() {
  const wsUrl = 'https://zdu.binghamton.edu:2345';
 
  return (
    <>
   <Spreadsheet wsUrl={wsUrl}/>
    
    </>
  )
}



export default App;
