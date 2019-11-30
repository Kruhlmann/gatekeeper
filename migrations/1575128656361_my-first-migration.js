/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createExtension("uuid-ossp");
    pgm.createTable("captchas", {
        id: {
            type: "uuid",
            default: pgm.func("uuid_generate_v4()"),
            notNull: true
        },
        user_id: {
            type: "varchar(1000)",
            notNull: true
        },
        answer: {
            type: "varchar(1000)",
            notNull: true
        },
        sent: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        }
    });
    pgm.createIndex("captchas", "id");
};

