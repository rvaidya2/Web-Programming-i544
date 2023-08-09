import React, { useState, useEffect } from 'react';
import { makeElement, Errors } from '../utils';
import SpreadsheetWs from '../ss-ws';



const [N_ROWS, N_COLS] = [10, 10];

interface SpreadsheetSelectorProps {
  wsUrl: string;
}

const Spreadsheet: React.FC<SpreadsheetSelectorProps> = ({ wsUrl }) => {
  const [spreadsheetName, setSpreadsheetName] = useState('');
  const [spreadsheetData, setSpreadsheetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ssWs = SpreadsheetWs.make(wsUrl);
      const dumpResult = await ssWs.dumpWithValues(spreadsheetName);
      console.log('Dump Result:', dumpResult);
      if (dumpResult.isOk) {
        setSpreadsheetData(dumpResult.val); 
      } else {
        console.error('Error fetching spreadsheet data:', dumpResult.errors);
      }
    } catch (error) {
      console.error('Error fetching spreadsheet data:', error);
    }finally {
      setLoading(false);
    }
    
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpreadsheetName(e.target.value);
  };
  

  useEffect(() => {
    makeEmptySS();
  }, [spreadsheetData]);

  const makeEmptySS = () => {
    const ssDiv = document.querySelector('#ss')!;
    ssDiv.innerHTML = '';
    const ssTable = makeElement('table');
    const header = makeElement('tr');
    const clearCell = makeElement('td');
    const clear = makeElement('button', { id: 'clear', type: 'button' }, 'Clear');
    clear.addEventListener('click', handleClear);
  clearCell.append(clear);
    clearCell.append(clear);
    header.append(clearCell);
    const A = 'A'.charCodeAt(0);
    for (let i = 0; i < N_COLS; i++) {
      header.append(makeElement('th', {}, String.fromCharCode(A + i)));
    }
    ssTable.append(header);
  
    for (let i = 0; i < N_ROWS; i++) {
      const row = makeElement('tr');
      row.append(makeElement('th', {}, (i + 1).toString()));
      const a = 'a'.charCodeAt(0);
      for (let j = 0; j < N_COLS; j++) {
        const colId = String.fromCharCode(a + j);
        const id = colId + (i + 1);
        const cell = makeElement('td', { id, className: 'cell', contentEditable: 'true' });
  
        // Find the corresponding value in spreadsheetData and set it in the cell
        const data = spreadsheetData.find(([cellId]) => cellId === id);
        if (data) {
          cell.setAttribute('data-expr', data[1]);
          cell.setAttribute('data-value', data[2].toString());
          cell.textContent = data[2].toString();
        }
  
        row.append(cell);
      }
      ssTable.append(row);
    }
  
    ssDiv.append(ssTable);
  };
  const handleClear = async () => {
    try {
      const ssWs = SpreadsheetWs.make(wsUrl);
      const clearResult = await ssWs.clear(spreadsheetName); // Call the clear function
      if (clearResult.isOk) {
        setSpreadsheetData([]); // Clear the data
        makeEmptySS(); // Reset the table view
        // Clear cell data
        document.querySelectorAll('.cell').forEach(c => {
          c.setAttribute('data-value', '');
          c.setAttribute('data-expr', '');
          c.textContent = '';
        });
      } else {
        console.error('Error clearing spreadsheet:', clearResult.errors);
      }
    } catch (error) {
      console.error('Error clearing spreadsheet:', error);
    }
  };


 
  return (
    <>
    <div>      
      <form id="ss-form" className="form" onSubmit={handleSubmit}>
        <label htmlFor="ws-url">Web Services URL</label>
        <input type="text" name="ws-url" id="ws-url" value={wsUrl} />
        <label htmlFor="ss-name">Spreadsheet Name</label>
        <input
          type="text"
          name="ss-name"
          id="ss-name"
          value={spreadsheetName}
          onChange={handleInputChange}
        />
       <label></label>
        <button type="submit">{loading ? 'Loading...' : 'Load Spreadsheet'}</button>
        
            
      </form>
      <div id="ss"></div>
    </div>
    </>
  );
};

export default Spreadsheet;