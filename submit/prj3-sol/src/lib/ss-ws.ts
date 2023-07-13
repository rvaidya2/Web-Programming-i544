import cors from "cors";
import Express from "express";
import bodyparser from "body-parser";
import assert from "assert";
import STATUS from "http-status";

import { Result, okResult, errResult, Err, ErrResult } from "cs544-js-utils";

import {
  SpreadsheetServices as SSServices,
  Spreadsheet,
  SpreadsheetDao,
} from "cs544-prj2-sol";

import {
  SelfLink,
  SuccessEnvelope,
  ErrorEnvelope,
} from "./response-envelopes.js";

export type App = Express.Application;

export function makeApp(ssServices: SSServices, base = "/api"): App {
  const app = Express();
  app.locals.ssServices = ssServices;
  app.locals.base = base;
  setupRoutes(app);
  return app;
}

/******************************** Routing ******************************/

const CORS_OPTIONS = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: "Location",
};

function setupRoutes(app: Express.Application) {
  const base = app.locals.base;
  app.use(cors(CORS_OPTIONS)); //will be explained towards end of course
  app.use(Express.json()); //all request bodies parsed as JSON.

  //routes for individual cells
  //TODO

  app.get(`${base}/:spreadsheetName/:cellId`, makeGetCellHandler(app));
  app.patch(`${base}/:spreadsheetName/:cellId`, makeUpdateCellHandler(app));
  app.delete(`${base}/:spreadsheetName/:cellId`, makeDeleteHandler(app));
  app.delete(`${base}/:spreadsheetName`, makeClearSpreadsheetHandler(app));
  app.put(`${base}/:spreadsheetName`, makeLoadSpreadsheetHandler(app));
  app.get(`${base}/:spreadsheetName`, makeGetSpreadsheetHandler(app));

  //routes for entire spreadsheets
  //TODO

  //generic handlers: must be last
  app.use(make404Handler(app));
  app.use(makeErrorsHandler(app));
}

/* A handler can be created by calling a function typically structured as
   follows:

   function makeOPHandler(app: Express.Application) {
     return async function(req: Express.Request, res: Express.Response) {
       try {
         const { ROUTE_PARAM1, ... } = req.params; //if needed
         const { QUERY_PARAM1, ... } = req.query;  //if needed
	 VALIDATE_IF_NECESSARY();
	 const SOME_RESULT = await app.locals.ssServices.OP(...);
	 if (!SOME_RESULT.isOk) throw SOME_RESULT;
         res.json(selfResult(req, SOME_RESULT.val));
       }
       catch(err) {
         const mapped = mapResultErrors(err);
         res.status(mapped.status).json(mapped);
       }
     };
   }
*/

/****************** Handlers for Spreadsheet Cells *********************/

//TODO
/*Implement the Get-Cell web service for reading a cell in a spreadsheet. Set up a suitable route in the router. The handler should be a simple wrapper around the query() service provided by app.locals.ssServices. Extract the spreadsheet name and cellId from req.param. Make sure you check for errors and convert them to HTTP errors using the procedure outlined earlier.
 */
function makeGetCellHandler(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    try {
      const {
        spreadsheet = req.params.spreadsheetName,
        cellId = req.params.cellId,
      } = req.params;
      const getCell = await app.locals.ssServices.query(spreadsheet, cellId);
      if (!getCell.isOk) throw getCell;
      res.json(selfResult(req, getCell.val));
    } catch (err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  };
}

/*Implement the Set-Cell web service. The handler should be triggered on a PATCH route and will require accessing the expr query parameter using req.query.expr. It will simply forward the request over to the evaluate() method on the spreadsheet services app.locals.ssServices. */
function makeUpdateCellHandler(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    try {
      const { spreadsheetName, cellId } = req.params;
      const { expr, srcCellId } = req.query;

      const intermediateResult = {
        isOk: Object.keys(req.query).length === 1,
        status: STATUS.BAD_REQUEST,
        errors: [{ options: { code: "BAD_REQ" } }],
      };

      if (!intermediateResult.isOk) {
        throw intermediateResult;
      }
      if (expr) {
        const setCell = await app.locals.ssServices.evaluate(
          spreadsheetName,
          cellId,
          expr
        );
        if (!setCell.isOk) throw setCell;
        res.json(selfResult(req, setCell.val));
      } else if (srcCellId) {
        const copyCell = await app.locals.ssServices.copy(
          spreadsheetName,
          cellId,
          srcCellId
        );
        if (!copyCell.isOk) throw copyCell;
        res.json(selfResult(req, copyCell.val));
      }
    } catch (err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  };
}

/**************** Handlers for Complete Spreadsheets *******************/

//TODO

function makeDeleteHandler(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    try {
      const { spreadsheetName, cellId } = req.params; //if needed

      const deleteCell = await app.locals.ssServices.remove(
        spreadsheetName,
        cellId
      );
      if (!deleteCell.isOk) throw deleteCell;
      res.json(selfResult(req, deleteCell.val));
    } catch (err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  };
}

function makeClearSpreadsheetHandler(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    try {
      const { spreadsheetName } = req.params; //if needed

      const clearSS = await app.locals.ssServices.clear(spreadsheetName);
      if (!clearSS.isOk) throw clearSS;
      res.json(selfResult(req, clearSS.val));
    } catch (err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  };
}

function makeLoadSpreadsheetHandler(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    try {
      const { spreadsheetName } = req.params;
      const dump: [string, string][] = req.body;

      // console.log(dump)
      const loadCell = await app.locals.ssServices.load(spreadsheetName, dump);

      if (!loadCell.isOk) throw loadCell;
      res.json(selfResult(req, loadCell.val));
    } catch (err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  };
}

function makeGetSpreadsheetHandler(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    try {
      const { spreadsheetName } = req.params;

      const getSpreadsheetResult = await app.locals.ssServices.dump(
        spreadsheetName
      );

      if (!getSpreadsheetResult.isOk) throw getSpreadsheetResult;

      res.json(selfResult(req, getSpreadsheetResult.val));
    } catch (err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  };
}
/*************************** Generic Handlers **************************/

/** Default handler for when there is no route for a particular method
 *  and path.
 */
function make404Handler(app: Express.Application) {
  return async function (req: Express.Request, res: Express.Response) {
    const message = `${req.method} not supported for ${req.originalUrl}`;
    const result = {
      status: STATUS.NOT_FOUND,
      errors: [{ options: { code: "NOT_FOUND" }, message }],
    };
    res.status(404).json(result);
  };
}

/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */
function makeErrorsHandler(app: Express.Application) {
  return async function (
    err: Error,
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) {
    const message = err.message ?? err.toString();
    const result = {
      status: STATUS.INTERNAL_SERVER_ERROR,
      errors: [{ options: { code: "INTERNAL" }, message }],
    };
    res.status(STATUS.INTERNAL_SERVER_ERROR as number).json(result);
    console.error(result.errors);
  };
}

/************************* HATEOAS Utilities ***************************/

/** Return original URL for req */
function requestUrl(req: Express.Request) {
  return `${req.protocol}://${req.get("host")}${req.originalUrl}`;
}

function selfHref(req: Express.Request, id: string = "") {
  const url = new URL(requestUrl(req));
  return url.pathname + (id ? `/${id}` : url.search);
}

function selfResult<T>(
  req: Express.Request,
  result: T,
  status: number = STATUS.OK
): SuccessEnvelope<T> {
  return {
    isOk: true,
    status,
    links: { self: { href: selfHref(req), method: req.method } },
    result,
  };
}

/*************************** Mapping Errors ****************************/

//map from domain errors to HTTP status codes.  If not mentioned in
//this map, an unknown error will have HTTP status BAD_REQUEST.
const ERROR_MAP: { [code: string]: number } = {
  EXISTS: STATUS.CONFLICT,
  NOT_FOUND: STATUS.NOT_FOUND,
  BAD_REQ: STATUS.BAD_REQUEST,
  AUTH: STATUS.UNAUTHORIZED,
  DB: STATUS.INTERNAL_SERVER_ERROR,
  INTERNAL: STATUS.INTERNAL_SERVER_ERROR,
};

/** Return first status corresponding to first options.code in
 *  errors, but SERVER_ERROR dominates other statuses.  Returns
 *  BAD_REQUEST if no code found.
 */
function getHttpStatus(errors: Err[]): number {
  let status: number = 0;
  for (const err of errors) {
    if (err instanceof Err) {
      const code = err?.options?.code;
      const errStatus = code !== undefined ? ERROR_MAP[code] : -1;
      if (errStatus > 0 && status === 0) status = errStatus;
      if (errStatus === STATUS.INTERNAL_SERVER_ERROR) status = errStatus;
    }
  }
  return status !== 0 ? status : STATUS.BAD_REQUEST;
}

/** Map domain/internal errors into suitable HTTP errors.  Return'd
 *  object will have a "status" property corresponding to HTTP status
 *  code.
 */
function mapResultErrors(err: Error | ErrResult): ErrorEnvelope {
  const errors =
    err instanceof Error
      ? [new Err(err.message ?? err.toString(), { code: "UNKNOWN" })]
      : err.errors;
  const status = getHttpStatus(errors);
  if (status === STATUS.SERVER_ERROR) console.error(errors);
  return { isOk: false, status, errors };
}
