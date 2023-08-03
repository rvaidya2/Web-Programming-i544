import SpreadsheetWs from "./ss-ws.js";

import { Result, okResult, errResult } from "cs544-js-utils";

import { Errors, makeElement } from "./utils.js";

const [N_ROWS, N_COLS] = [10, 10];

export default async function make(ws: SpreadsheetWs, ssName: string) {
  return await Spreadsheet.make(ws, ssName);
}

class Spreadsheet {
  private readonly ws: SpreadsheetWs;
  private readonly ssName: string;
  private readonly errors: Errors;
  private readonly isCellFocusedMap: { [cellId: string]: boolean } = {};
  private focusedCellId: string | null = null;
  private copySourceCellId: any | null;
  //TODO: add more instance variables

  constructor(ws: SpreadsheetWs, ssName: string) {
    this.ws = ws;
    this.ssName = ssName;
    this.errors = new Errors();
    this.makeEmptySS();
    this.addListeners();
    this.isCellFocusedMap = {};
    
    //TODO: initialize added instance variables
  }

  static async make(ws: SpreadsheetWs, ssName: string) {
    const ss = new Spreadsheet(ws, ssName);
    await ss.load();
    return ss;
  }

  /** add listeners for different events on table elements */
  private addListeners() {
    
    //TODO: add listeners for #clear and .cell
    const clearButton = document.getElementById('clear')!;
  if (clearButton) {
    clearButton.addEventListener('click', this.clearSpreadsheet);
  }

  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell) => {
    cell.addEventListener('focusin', this.focusCell);
    cell.addEventListener('focusout', this.blurCell);
    cell.addEventListener('copy', this.copyCell);
    cell.addEventListener('paste', this.pasteCell);
  });
  }

  /** listener for a click event on #clear button */
  private readonly clearSpreadsheet = async (ev: Event) => {
    //TODO
    
  const cells = document.querySelectorAll('.cell');
  const result = await this.ws.clear(this.ssName);
  if (!result.isOk) {
    this.errors;
  }
  
  for (const cell of cells) {    
    cell.textContent = '';
    cell.removeAttribute('data-value');
    cell.removeAttribute('data-expr');
  
  }

  
  
  };

  /** listener for a focus event on a spreadsheet data cell */
  private readonly focusCell = (ev: Event) => {
    const cell = ev.target as HTMLElement;
    const expr = cell.getAttribute('data-expr');
    // console.log("EXPR",expr)
    if (expr != null) {
      cell.textContent = expr;   
            
       
    }
    this.focusedCellId = cell.id;
    
  };  
  

   /** listener for a blur event on a spreadsheet data cell */
private readonly blurCell = async (ev: Event) => {
  const cellAll = document.querySelectorAll('.cell');
  


  // const cellsWithData = Array.from(cellAll).filter((cell) => {
  //   const dataValue = cell.getAttribute('data-value');
  //   const dataExpr = cell.getAttribute('data-expr');
  //   return dataValue !== null && dataExpr !== null;
  // });

  
  // console.log("CELL WITH DATA",cellsWithData);

  

  const cell = ev.target as HTMLElement; 
  const cellId = cell.id;
  const expr = cell.textContent; 
  console.log("cell",cell)

  // console.log("CELL", cell)
  // console.log("CELLAll", cellAll)

  if (cellId === "" || expr === "") {    
    const result = await this.ws.remove(this.ssName, cellId);    
    if (!result.isOk) {
      this.errors.display;
    }
    cell.textContent = "";
    cell.removeAttribute('data-value');
    cell.removeAttribute('data-expr');
  } else {
    
    if(expr !== null){
    const result = await this.ws.evaluate(this.ssName, cellId, expr);
    if (result.isOk) {
      
      const data = result.val;   
      
      const keys = Object.keys(data);
      const values = Object.values(data);
      console.log("data",data)
      console.log("key",keys)
      console.log("values",values)
      const key = keys[0]; 
      const value = data[key];      
      cell.textContent = value.toString();
      cell.setAttribute('data-value', value.toString()); 
      
    
      

     
      
      
    } else {
      this.errors.display;      
    }
  }
  }
  this.focusedCellId = null;
};






  /** listener for a copy event on a spreadsheet data cell */
  private readonly copyCell = (ev: Event) => {    
    //TODO
    const cell = ev.target as HTMLElement;
    
    this.copySourceCellId = cell;
    const newCopy = this.ws.query(this.ssName, this.copySourceCellId)
    cell.classList.add('is-copy-source');
    
    
  };

  /** listener for a paste event on a spreadsheet data cell */
  private readonly pasteCell = async (ev: Event) => {
    
    //TODO
    // const cell = ev.target as HTMLElement;
    if(this.copySourceCellId !== null){
    this.copySourceCellId.classList.remove('is-copy-source');
    }
    
  };

  /** Replace entire spreadsheet with that from the web services.
   *  Specifically, for each active cell set its data-value and
   *  data-expr attributes to the corresponding values returned
   *  by the web service and set its text content to the cell value.
   */
  /** load initial spreadsheet data into DOM */
  private async load() {
      //TODO
    const result = await this.ws.dumpWithValues(this.ssName);
  if (result.isOk) {    
   const data = result.val;
  //  console.log(data)
   for(const [cellId, expr, value] of data){
    const cell = document.getElementById(cellId);
      if (cell) {
        cell.textContent = value.toString();
        cell.setAttribute('data-value', value.toString());
        cell.setAttribute('data-expr', expr);
      }
      
    }
    
  } else {
    this.errors;
  }
   
  }

  
  

  private makeEmptySS() {
    const ssDiv = document.querySelector("#ss")!;
    ssDiv.innerHTML = "";
    const ssTable = makeElement("table");
    const header = makeElement("tr");
    const clearCell = makeElement("td");
    const clear = makeElement(
      "button",
      { id: "clear", type: "button" },
      "Clear"
    );
    clearCell.append(clear);
    header.append(clearCell);
    const A = "A".charCodeAt(0);
    for (let i = 0; i < N_COLS; i++) {
      header.append(makeElement("th", {}, String.fromCharCode(A + i)));
    }
    ssTable.append(header);
    for (let i = 0; i < N_ROWS; i++) {
      const row = makeElement("tr");
      row.append(makeElement("th", {}, (i + 1).toString()));
      const a = "a".charCodeAt(0);
      for (let j = 0; j < N_COLS; j++) {
        const colId = String.fromCharCode(a + j);
        const id = colId + (i + 1);
        const cell = makeElement("td", {
          id,
          class: "cell",
          contentEditable: "true",
        });
        row.append(cell);
      }
      ssTable.append(row);
    }
    ssDiv.append(ssTable);
  }
}
