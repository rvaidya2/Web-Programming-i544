import { stringify } from "querystring";
import { default as parse, CellRef, Ast } from "./expr-parser.js";

import { Result, okResult, errResult } from "cs544-js-utils";
import { assert } from "console";
import exp from "constants";

//factory method
export default async function makeSpreadsheet(
  name: string
): Promise<Result<Spreadsheet>> {
  return okResult(new Spreadsheet(name));
}

type Updates = { [cellId: string]: number };

class cellInfo {
  readonly id: string;
  readonly expr: string;
  readonly ast: string;
  readonly value: number;
  readonly dependents: string;

  constructor(
    id: string,
    expr: string,
    ast: string,
    value: number,
    dependents: string
  ) {
    this.id = id;
    this.expr = expr;
    this.ast = ast;
    this.value = value;
    this.dependents = dependents;
  }
}

// let cell:cellInfo[];
let mapCells = new Map<string, string>();
export class Spreadsheet {
  readonly name: string;
  // readonly mapCells: Map<string, string>;

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
  async eval(cellId: string, expr: string): Promise<Result<Updates>> {
    let keyname: string = cellId;
    JSON.stringify(keyname);

    //TODO
    let value = parse(expr);

    let res = 0;
    if (value.isOk) {
      // console.log(value.val);

      res = this.Avalue(value.val, expr);

      mapCells.set(cellId, res.toString());
    } else if (value.errors) {
      return errResult(value);
    }

    var spliting = expr.split(" ");
    // console.log("split " + spliting + "     Type " + typeof spliting);

    for (var i = 0; i < spliting.length; i++) {
      if (spliting[i] == keyname) {
        // console.log("Circular ref found : " + spliting[i]);
        const msg = `cyclic dependency ...`;
        return errResult(msg, "CIRCULAR_REF");
        // }else if(mapCells.has(spliting[i]) ){
        //   console.log(mapCells.has(spliting[i]))
        //   const msg = `Indirect cyclic dependency ...`;
        //   return errResult(msg, "CIRCULAR_REF");
        // }
      }
    }

    return okResult({ [keyname]: res }); //initial dummy result
  }

  //TODO: add additional methods
  splitFunction(expression: string): string[] {
    let arrString = [];
    // const regex = /[+*-\s]+/g;
    arrString = expression.split(" ");
    return arrString;
  }

  Avalue(node: Ast, exp?: string): number {
    // console.log(typeof(exp));
    // console.log(exp);

    if (node.kind === "num") {
      return node.value;
    } else if (node.kind === "app") {
      const kidValues = node.kids.map((kid) => this.Avalue(kid, exp));

      // console.log(kidValues);

      if (node.fn) {
        // console.log(node.fn);
        if (kidValues.length == 2) {
          return FNS[node.fn](kidValues[0], kidValues[1]);
        } else if (node.fn == "-") {
          return -1 * kidValues[0];
        } else {
          return kidValues[0];
        }
      }
    } else if (node.kind === "ref") {
      // console.log("In ref" + e);
      // console.log(exp)

      if (exp) {
        let arr: string[] = this.splitFunction(exp);
        // console.log("Array Length: "+ arr.length)
        if (arr.length == 1) {
          return Number(mapCells.get(arr[0]));
        } else {
          let arr2: string[] = [];
          let str: string = "";
          // console.log("String array"+arr);
          for (let i = 0; i < arr.length; i++) {
            if (i % 2 != 0) {
              arr2.push(arr[i]!);
              // console.log("Mapped value  "+ str)
            } else {
              arr2.push(mapCells.get(arr[i])!);
            }
          }
          // console.log("ARR2:  " +arr2.toString());
          let merged = arr2.join(" ");
          // console.log(merged);
          const ast = parse(merged);
          // console.log("AST: " + JSON.stringify(ast))

          if (ast.isOk) {
            // console.log(this.AnotherFunction(ast.val))
            const ans = this.AnotherFunction(ast.val);
            //  console.log("ANSWER: " +ans)
            return ans;
          }
        }
      }
    }
    return 0;
  }

  AnotherFunction(node: Ast): number {
    if (node.kind === "num") {
      return node.value;
    } else if (node.kind === "app") {
      const kidValues = node.kids.map((kid) => this.Avalue(kid));

      // console.log(kidValues);

      if (node.fn) {
        // console.log(node.fn);
        if (kidValues.length == 2) {
          // console.log(FNS[node.fn](kidValues[0], kidValues[1]))
          let a = FNS[node.fn](kidValues[0], kidValues[1]);
          return a;
        } else if (node.fn == "-") {
          return -1 * kidValues[0];
        } else {
          return kidValues[0];
        }
      }
    }

    return 0;
  }
}

//TODO: add additional classes and/or functions

const FNS = {
  "+": (a: number, b: number): number => a + b,
  "-": (a: number, b?: number): number => (b === undefined ? -a : a - b),
  "*": (a: number, b: number): number => a * b,
  "/": (a: number, b: number): number => a / b,
  min: (a: number, b: number): number => Math.min(a, b),
  max: (a: number, b: number): number => Math.max(a, b),
};
