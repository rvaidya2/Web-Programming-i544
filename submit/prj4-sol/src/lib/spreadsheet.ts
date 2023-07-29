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
    const clearButton = document.getElementById('clear');
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
    // const cells = ev.currentTarget as HTMLElement;
    // console.log("Cells",cells)
  const cells = document.querySelectorAll('.cell');
  if(cells != null){
  for (const cell of cells) {    
    cell.textContent = '';
    cell.removeAttribute('data-value');
    cell.removeAttribute('data-expr');
  }
}
  const result = await this.ws.clear(this.ssName);

  if (!result.isOk) {
    this.errors;
  }
  
  };

  /** listener for a focus event on a spreadsheet data cell */
  private readonly focusCell = (ev: Event) => {
    const cell = ev.target as HTMLElement;
    const expr = cell.getAttribute('data-expr');
    if (expr != null) {
      cell.textContent = expr;
      // console.log(this.isCellFocusedMap)
      // console.log(this.isCellFocusedMap[cell.id])
      this.isCellFocusedMap[cell.id] = true; // Set the flag to true when a cell is focused
    // console.log(this.isCellFocusedMap[cell.id])
       
    }
    
  };  
  

  /** listener for a blur event on a spreadsheet data cell */
  private readonly blurCell = async (ev: Event) => {     
    //TODO
    const cell = ev.target as HTMLElement;
    const expr = cell.getAttribute('data-expr');
    const id = cell.getAttribute('id');
// console.log("CELL: ",cell," EXPR: ",expr)
    // console.log("ev.target", ev.target)
    if(this.isCellFocusedMap && id !== null && expr !== null){
    const result = await this.ws.evaluate(this.ssName,  id, expr )
    console.log("Result ",result)
    if(result.isOk){
      const valObject = result.val;
      const firstPropertyName = Object.keys(valObject)[0];
      const firstPropertyValue = valObject[firstPropertyName];
      console.log("Object:", firstPropertyValue); 
      cell.textContent = JSON.stringify(firstPropertyValue);
    }else{
      this.errors;
    }
      
    }
    

  };

  /** listener for a copy event on a spreadsheet data cell */
  private readonly copyCell = (ev: Event) => {
    
    //TODO
  };

  /** listener for a paste event on a spreadsheet data cell */
  private readonly pasteCell = async (ev: Event) => {
    //TODO
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
   console.log(data)
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
