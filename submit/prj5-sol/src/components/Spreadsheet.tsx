import React from 'react';
import { Errors, makeElement } from '../utils';



const N_ROWS = 10;
const N_COLS = 10;

interface CellData {
  cellId: string;
  value: number;
}

interface SpreadsheetProps {
  data: CellData[];
}

class Spreadsheet extends React.Component<SpreadsheetProps> {
  componentDidMount() {
    this.makeEmptySS();
  }

  makeEmptySS() {
    const ssDiv = document.querySelector('#ss')!;
    ssDiv.innerHTML = '';
    const ssTable = makeElement('table');
    const header = makeElement('tr');
    const clearCell = makeElement('td');
    const clear = makeElement('button', { id: 'clear', type: 'button' }, 'Clear');
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
        const cell = makeElement('td', {
          id,
          className: 'cell',
          contentEditable: 'true',
        });
        row.append(cell);
      }
      ssTable.append(row);
    }
    ssDiv.append(ssTable);
  }


  updateCellValue = (cellId: string, value: number) => {
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.textContent = value.toString();
    }
  };

  render() {
    const { data } = this.props;

    // Update cell values using the received data
    data.forEach((cellData: { cellId: string; value: number; }) => {
      this.updateCellValue(cellData.cellId, cellData.value);
    });

    return <div id="ss" />;
  }
}

export default Spreadsheet;
