import { stringify } from 'querystring';
import {default as parse, CellRef, Ast } from './expr-parser.js';

import { Result, okResult, errResult } from 'cs544-js-utils';

//factory method
export default async function makeSpreadsheet(name: string) :
  Promise<Result<Spreadsheet>>
{
  return okResult(new Spreadsheet(name));
}

type Updates = { [cellId: string]: number };

class cellInfo{
readonly id : string;
readonly expr: string;
readonly ast : string;
readonly value : number;
readonly dependents : string;

  constructor(id : string,expr: string,ast: string,value:number,dependents: string){
    this.id = id;
    this.expr = expr;
    this.ast = ast;
    this.value = value;
    this.dependents = dependents;

  }
  
}


// let cell:cellInfo[];

export class Spreadsheet {

  

  readonly name: string;
  //TODO: add other instance variable declarations  
  constructor(name: string) {
    this.name = name;
    
    //TODO: add initializations for other instance variables
  }

  /** Set cell with id cellId to result of evaluating formula
   *  specified by the string expr.  Update all cells which are
   *  directly or indirectly dependent on the base cell cellId.
   *  Return an object mapping the id's of all updated cells to
   *  their updated values.  
   *
   *  Errors must be reported by returning an error Result having its
   *  code options property set to `SYNTAX` for a syntax error and
   *  `CIRCULAR_REF` for a circular reference and message property set
   *  to a suitable error message.
   */
  async eval(cellId: string, expr: string) : Promise<Result<Updates>> {

    // let dict ={}
    let keyname : string = cellId;
    JSON.stringify(keyname)
    let stringToObject = {
      [keyname] : expr
    }
    console.log()
    //TODO  
    // console.log(cellId);  
    // console.log(expr);
     let value = parse(expr);
    //  console.log(value)
    //  console.log(cellId)
    //  console.log(expr)
    // let value = this.Avalue(ast.val);
    console.log(JSON.stringify(value,null,2));

    let res = 0;
    if(value.isOk)
    {
      // console.log(value.val);
      res = this.Avalue(value.val);
      
    }else if(value.errors){
      return errResult(value);
    }
    
    
    // console.log(value);
    return okResult({[keyname]: res }); //initial dummy result
  }
    
  //TODO: add additional methods

  /*
   Avalue(ast: Ast): number {
    if(ast.kind == "num")
    {
      var arr = [];
      if(arr.length < 2){
      arr.push(ast.value);
      }
     return ast.value;
    }
    if(ast.kind == "app")
    {

      console.log(FNS[ast.fn](this.Avalue(ast.kids[0]),this.Avalue(ast.kids[1])))
      // return this.Avalue(ast.kids[0]) + this.Avalue(ast.kids[1]);
      return FNS[ast.fn](this.Avalue(ast.kids[0]),this.Avalue(ast.kids[1]));
      
      
      
    }

    

    return 0;
  }
}
*/

/*
Avalue(ast: Ast): number {
  if (ast.kind === "num") {
    return ast.value;
    
  } else if (ast.kind === "app") {
    const fn = FNS[ast.fn];
    const args = ast.kids.map((kid) => this.Avalue(kid));
    return fn.apply(null,args);
  }
  return 0;
}
}
*/

 Avalue(node: Ast): number {
  if (node.kind === 'num') {
    return node.value;
  } else if (node.kind === 'app') {
     const kidValues = node.kids.map((kid) => this.Avalue(kid));
     
      console.log(kidValues)
     
     if(node.fn)
     {
         console.log(node.fn)
         if(kidValues.length == 2)
         {
             return FNS[node.fn](kidValues[0],kidValues[1]);
         }
         else if(node.fn == '-')
         {
             return (-1 * kidValues[0]);
         }
         else {
             return kidValues[0];
         }
     }
    
  }
  return 0;
}
}

//TODO: add additional classes and/or functions


const FNS = {
  '+': (a:number, b:number) : number => a + b,
  '-': (a:number, b?:number) : number => b === undefined ? -a : a - b,
  '*': (a:number, b:number) : number => a * b,
  '/': (a:number, b:number) : number => a / b,
  min: (a:number, b:number) : number => Math.min(a, b),
  max: (a:number, b:number) : number => Math.max(a, b),
}
