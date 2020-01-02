/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.addColumns("captchas", {
        text: {
            type: "varchar(1000)",
            default: "",
            notNull: true,
        },
        quiz_id: {
            type: "varchar(1000)",
            default: "",
            notNull: true,
        }
    });
    pgm.createIndex("captchas", "user_id");
};

exports.down = (pgm) => {
    pgm.dropColumns("captchas", ["text", "quiz_id"])
    pgm.dropIndex("captchas", "user_id");
};
