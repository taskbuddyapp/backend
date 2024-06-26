import { Pool, QueryResult } from "pg";
import * as fs from "fs";
import * as path from "path";
import { dbHost, dbPassword, dbPort, dbUser } from "../config";
import { isKillswitchEnabled } from "../utils/global_killswitches";
import { KillswitchTypes } from "./models/killswitch";

const pool = new Pool({
    user: dbUser,
    host: dbHost,
    database: "taskbuddy",
    password: dbPassword,
    port: dbPort,
});

export function getPool() {
    return pool;
}

/**
 * Connect to the database
 */
export function connect() {
    return new Promise(async (resolve, reject) => {
        await _connect();
        resolve(true);
    });
}

export async function disconnect() {
    await pool.end();
}

/**
 * Attempt to connect to the database every second until successful
 */
function _connect() {
    return new Promise((resolve, reject) => {
        pool.connect((err: Error) => {
            if (err) {
                console.log(err);
                setTimeout(_connect, 1000);
            }
            resolve(true);
        });
    });
}

/**
 * Execute a query on the database
 * @param query - the query to execute
 * @param params - the parameters to pass to the query
 * @returns {Promise<T[]>} - the result of the query
 */
export function executeQuery<T>(
    query: string,
    params: any[] = []
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (err: Error, result: QueryResult) => {
            if (isKillswitchEnabled(KillswitchTypes.DISABLE_ALL)) {
                reject("Service Unavailable");
            } else if (err) {
                reject(err);
            } else {
                resolve(result.rows);
            }
        });
    });
}

/**
 * Execute a query on the database from a file
 * @param filePath - the path to the file containing the query
 * @param params - the parameters to pass to the query
 * @returns {Promise<T[]>} - the result of the query
 */
export async function executeFile<T>(
    filePath: string,
    params: any[] = []
): Promise<T[]> {
    const query = fs.readFileSync(path.resolve(__dirname, filePath), "utf8");
    const result = await executeQuery<T>(query, params);
    return result;
}
