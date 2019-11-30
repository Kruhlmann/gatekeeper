/**
 * @fileoverview PosgreSQL connection handler.
 * @since 1.0.0
 * @author Kruhlmann
 */

import { Pool } from "pg";
import { Captcha } from "./typings/types";

const DB_USR = process.env.GATEKEEPER_DB_USR;
const DB_PWD = process.env.GATEKEEPER_DB_PWD;
const DB_NAM = process.env.GATEKEEPER_DB_NAM;

let instance: DB;

export class DB {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: DB_USR,
            host: "localhost",
            database: DB_NAM,
            password: DB_PWD,
            port: 5432,
        });
    }


    public async get_captchas(id = "", user_id = ""): Promise<Captcha[]> {
        return new Promise((resolve, reject) => {
            this.pool.query("SELECT * FROM captchas WHERE (id=$1::uuid OR $1::text='') AND (user_id=$2::text OR $2::text='')", [id, user_id], (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res.rows);
            });
        });
    }

    public async register_captcha(user_id: string, answer: string): Promise<Captcha> {
        return new Promise((resolve, reject) => {
            this.pool.query("INSERT INTO captchas (user_id, answer) VALUES ($1::text, $2::text) RETURNING *", [user_id, answer], (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res.rows[0]);
            });
        });
    }
}

export function connect() {
    if (!instance) {
        instance = new DB();
    }
    return instance;
}
