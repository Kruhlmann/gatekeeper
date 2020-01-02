/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable("quizs", {
        id: {
            type: "uuid",
            default: pgm.func("uuid_generate_v4()"),
            notNull: true
        },
        user_id: {
            type: "varchar(1000)",
            notNull: true
        },
        active: {
            type: "boolean",
            default: true,
            notNull: true
        },
        completed: {
            type: "integer",
            default: 0,
            notNull: true
        },
        wrong: {
            type: "integer",
            default: 0,
            notNull: true
        },
        updatedAt: {
            type: "timestamp",
            notNull: true,
        },
        createdAt: {
            type: "timestamp",
            notNull: true,
        },
    });
    pgm.createIndex("quizs", "id");
};

exports.down = (pgm) => {
    pgm.dropTable("quizs", { ifExists: true });
};
