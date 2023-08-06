import React from 'react';
import LoadForm from './components/TopLevelUI';
import Spreadsheet from './components/Spreadsheet';
import SpreadsheetWs from './ss-ws';



function App() {
  const wsUrl = 'https://zdu.binghamton.edu:2345';
 
  return (
    <>
    <LoadForm wsUrl={wsUrl}/>
    <Spreadsheet/>
    </>
  )
}



export default App;
