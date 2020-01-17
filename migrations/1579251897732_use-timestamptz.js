/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.alterColumn("quizs", "createdAt", { type: "timestamptz" });
    pgm.alterColumn("quizs", "updatedAt", { type: "timestamptz" });

    pgm.alterColumn("captchas", "createdAt", { type: "timestamptz" });
    pgm.alterColumn("captchas", "updatedAt", { type: "timestamptz" });
};

exports.down = (pgm) => {
    pgm.alterColumn("quizs", "createdAt", { type: "timestamp" });
    pgm.alterColumn("quizs", "updatedAt", { type: "timestamp" });

    pgm.alterColumn("captchas", "createdAt", { type: "timestamp" });
    pgm.alterColumn("captchas", "updatedAt", { type: "timestamp" });
};
