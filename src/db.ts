/**
 * @fileoverview PosgreSQL connection handler.
 * @since 1.0.0
 * @author Kruhlmann
 */

import * as discord from "discord.js";
import { DataTypes, Model, Op, Sequelize } from "sequelize";
import { log } from "./io";
import { LoggingLevel } from "./typings/types";

const DB_USR = process.env.GATEKEEPER_DB_USR;
const DB_PWD = process.env.GATEKEEPER_DB_PWD;
const DB_NAM = process.env.GATEKEEPER_DB_NAM;

let instance: DB;

export class Captcha extends Model {
    public id!: string;
    public user_id!: string;
    public quiz_id!: string;
    public text!: string;
    public answer!: string;
    public active!: boolean;
    public completed!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export class Quiz extends Model {
    public id!: string;
    public user_id!: string;
    public active!: boolean;
    public wrong!: number;
    public completed!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export class DB {
    private connection: Sequelize;

    constructor() {
        this.connection = new Sequelize(DB_NAM, DB_USR, DB_PWD, {
            host: "localhost",
            dialect: "postgres",
            logging: (msg) => log(msg, LoggingLevel.DEV),
        });

        this.connection.authenticate().then(() => {
            log("Successfully connected to DB on localhost:5432");
        });

        this.init_models();
    }

    private init_models() {
        Captcha.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: Sequelize.literal("uuid_generate_v4()"),
                    allowNull: false,
                    primaryKey: true,
                },
                user_id: {
                    type: DataTypes.STRING(1000),
                    allowNull: false,
                },
                quiz_id: {
                    type: DataTypes.STRING(1000),
                    allowNull: false,
                },
                text: {
                    type: DataTypes.STRING(1000),
                    allowNull: false,
                },
                answer: {
                    type: DataTypes.STRING(1000),
                    allowNull: false,
                },
                active: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false,
                },
                completed: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
            },
            {
                sequelize: this.connection,
                tableName: "captchas",
            }
        );

        Quiz.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: Sequelize.literal("uuid_generate_v4()"),
                    allowNull: false,
                    primaryKey: true,
                },
                user_id: {
                    type: DataTypes.STRING(1000),
                    allowNull: false,
                },
                active: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false,
                },
                wrong: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    allowNull: false,
                },
                completed: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    allowNull: false,
                },
            },
            {
                sequelize: this.connection,
                tableName: "quizs",
            }
        );
    }
}

export function connect() {
    if (!instance) {
        instance = new DB();
    }
    return instance;
}

export function find_one(table: any, author: discord.User): Promise<any> {
    return table.findOne({
        order: ["createdAt"],
        where: { [Op.and]: [{ user_id: author.id }, { active: true }] },
    });
}
