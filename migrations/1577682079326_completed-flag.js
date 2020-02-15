/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.addColumns("captchas", {
        completed: {
            type: "boolean",
            default: false,
            notNull: true,
        }
    });
};

exports.down = (pgm) => {
    pgm.dropColumns("captchas", ["completed"])
};
