import { Result, okResult, errResult } from 'cs544-js-utils';

import * as mongo from 'mongodb';

/** All that this DAO should do is maintain a persistent map from
 *  [spreadsheetName, cellId] to an expression string.
 *
 *  Most routines return an errResult with code set to 'DB' if
 *  a database error occurs.
 */

/** return a DAO for spreadsheet ssName at URL mongodbUrl */
export async function
makeSpreadsheetDao(mongodbUrl: string, ssName: string)
  : Promise<Result<SpreadsheetDao>> 
{
  return SpreadsheetDao.make(mongodbUrl, ssName);
}

export class SpreadsheetDao {

  private client : mongo.MongoClient;
  private collection : mongo.Collection;

  constructor(client: mongo.MongoClient, collection: mongo.Collection){
    this.client = client;
    this.collection = collection;
  }

  //TODO: add properties as necessary
  
  //factory method
  static async make(dbUrl: string, ssName: string)
    : Promise<Result<SpreadsheetDao>>
  {
    try {
      const client = await mongo.MongoClient.connect(dbUrl);
      const db = client.db(ssName);
      const collection = db.collection('expressions');
      return okResult(new SpreadsheetDao(client, collection));
    } catch (error) {
      return errResult('DB', error);
    }
    //TODO
    // return okResult(new SpreadsheetDao());
  }

  /** Release all resources held by persistent spreadsheet.
   *  Specifically, close any database connections.
   */
  async close() : Promise<Result<undefined>> {
    try {
      await this.client.close();
      return okResult(undefined);
    } catch (error) {
      return errResult('DB', error);
    }
    //TODO
    // return okResult(undefined);
  }

  /** return name of this spreadsheet */
  getSpreadsheetName() : string {
    
    return this.collection.dbName;
    //TODO
    // return 'TODO';
  }

  /** Set cell with id cellId to string expr. */
  async setCellExpr(cellId: string, expr: string)
    : Promise<Result<undefined>>
  {
    //TODO
    return okResult(undefined);
  }

  /** Return expr for cell cellId; return '' for an empty/unknown cell.
   */
  async query(cellId: string) : Promise<Result<string>> {
    //TODO
    return okResult('TODO');
  }

  /** Clear contents of this spreadsheet */
  async clear() : Promise<Result<undefined>> {
    //TODO
    return okResult(undefined);
  }

  /** Remove all info for cellId from this spreadsheet. */
  async remove(cellId: string) : Promise<Result<undefined>> {
    //TODO
    return okResult(undefined);
  }

  /** Return array of [ cellId, expr ] pairs for all cells in this
   *  spreadsheet
   */
  async getData() : Promise<Result<[string, string][]>> {
    //TODO
    return okResult([]);
  }

}




