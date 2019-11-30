/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.addColumns("captchas", {
        active: {
            type: "boolean",
            default: true,
            notNull: true,
        }
    });
};

exports.down = (pgm) => {
    pgm.dropColumns("captchas", ["active"]);
};
