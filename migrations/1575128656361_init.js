/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createExtension("uuid-ossp", { ifNotExists: true });
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

exports.down = (pgm) => {
    pgm.dropTable("captchas", { ifExists: true });
    pgm.dropExtension("uuid-ossp", { ifExists: true });

}

