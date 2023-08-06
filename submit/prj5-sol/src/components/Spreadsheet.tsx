import React from 'react';


const N_ROWS = 10;
const N_COLS = 10;

class Spreadsheet extends React.Component {
  componentDidMount() {
    this.makeEmptySS();
  }

  makeEmptySS() {
    const ssDiv = document.querySelector('#ss')!;
    ssDiv.innerHTML = '';
    const ssTable = this.makeElement('table');
    const header = this.makeElement('tr');
    const clearCell = this.makeElement('td');
    const clear = this.makeElement('button', { id: 'clear', type: 'button' }, 'Clear');
    clearCell.append(clear);
    header.append(clearCell);
    const A = 'A'.charCodeAt(0);
    for (let i = 0; i < N_COLS; i++) {
      header.append(this.makeElement('th', {}, String.fromCharCode(A + i)));
    }
    ssTable.append(header);
    for (let i = 0; i < N_ROWS; i++) {
      const row = this.makeElement('tr');
      row.append(this.makeElement('th', {}, (i + 1).toString()));
      const a = 'a'.charCodeAt(0);
      for (let j = 0; j < N_COLS; j++) {
        const colId = String.fromCharCode(a + j);
        const id = colId + (i + 1);
        const cell = this.makeElement('td', {
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

  makeElement(tag: string, attributes: any = {}, content?: string | HTMLElement) {
    const element = document.createElement(tag);
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
    if (content) {
      if (typeof content === 'string') {
        element.textContent = content;
      } else {
        element.appendChild(content);
      }
    }
    return element;
  }

  render() {
    return <div id="ss" />;
  }
}

export default Spreadsheet;
