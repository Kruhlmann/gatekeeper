/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.dropColumns("captchas", "sent");
    pgm.addColumns("captchas", {
        updatedAt: {
            type: "timestamp",
            notNull: true,
        },
        createdAt: {
            type: "timestamp",
            notNull: true,
        },
    })
};

exports.down = (pgm) => {
    pgm.dropColumns("captchas", ["updatedAt", "createdAt"]);
    pgm.addColumns("captchas", {
        sent: {
            type: "timestamp",
            notNull: true,
        }
    })
};
