/**
 * @fileoverview Main entry point for application.
 * @author Andreas Kruhlmann
 * @since 1.0.0
 */

import * as discord from "discord.js";
import { Op } from "sequelize";
import * as config from "../config.json";
import { make_captcha_message, send_captcha } from "./captcha_broker";
import * as psql from "./db";
import { handle_exception, log, init_sentry } from "./io";
import { t_diff } from "./time";
import { LoggingLevel } from "./typings/types";

const req_env_vars = [
    "GATEKEEPER_DB_USR",
    "GATEKEEPER_DB_PWD",
    "GATEKEEPER_DB_NAM",
    "GATEKEEPER_DISCORD_TOKEN",
];

// Global exception handling.
process.on("uncaughtException", handle_exception);
process.on("unhandledRejection", handle_exception);

let db: psql.DB;

function make_github_issue_suffix(captcha: psql.Captcha): string {
    return (
        `\n\n*Experiencing problems with my programming? [Open an issue](https://github.com/Kruhlmann/gatekeeper/issues/new?assignees=Kruhlmann&labels=bug&template=captcha-issue.md&title=%5BCAPTCHA%5D)*` +
        `\nYour ID: \`${captcha.quiz_id}\\${captcha.id}\``
    );
}

/**
 * Ensures the prescense of all required environment variables. If any are
 * missing the program closes.
 *
 * @param variable_keys - Names of required environment variables.
 */
function validate_environment(variable_keys: string[]): boolean {
    let valid = true;
    for (const env_var of variable_keys) {
        if (!process.env.hasOwnProperty(env_var)) {
            log(`Missing environment variable: ${env_var}`, LoggingLevel.ERR);
            valid = false;
        } else {
            log(
                `Found required environment variable ${env_var}`,
                LoggingLevel.DEV
            );
        }
    }

    return valid;
}

// Main fucntion.
(async () => {
    // Check for all environment variables.
    if (!validate_environment(req_env_vars)) {
        process.exit(1);
    }

    // Sentry logging
    init_sentry();

    // Init discord virtual client.
    const discord_client = new discord.Client();
    const dicord_token = process.env.GATEKEEPER_DISCORD_TOKEN;

    // Init database.
    db = psql.connect();

    log("Awaiting response from discord", LoggingLevel.DEV);

    discord_client.on("ready", () => {
        log(`Started gatekeeper in ${config.deployment_mode} mode`);
    });

    discord_client.on("message", (message: discord.Message) => {
        // Ignore our own messages
        if (message.author.id === discord_client.user.id) {
            return;
        }

        const guild = discord_client.guilds.get(config.guild_id);
        const user = guild.members.get(message.author.id);
        const write_role = guild.roles.get(config.role);
        if (!user) {
            return;
        }
        const has_write_role = !!user.roles.find((role) => {
            return role.id === config.role;
        });

        // Ignore messages from those already with the write role
        if (config.deployment_mode === "production" && has_write_role) {
            return;
        }

        // Handle '!captcha' messages in public text channels
        if (message.channel.type !== "dm") {
            if (message.content !== "!captcha") {
                return;
            }

            if (config.deployment_mode === "production") {
                psql.find_one(psql.Quiz, user.user).then((quiz: psql.Quiz) => {
                    if (quiz) {
                        const expires = new Date(quiz.createdAt);
                        expires.setDate(expires.getDate() + 1);
                        if (expires >= new Date()) {
                            return message.reply(
                                `You already have a pending captcha. You can request a new one ${t_diff(
                                    expires,
                                    new Date()
                                )}.`
                            );
                        }
                    }
                    send_captcha(user, message.channel);
                });
            } else {
                send_captcha(user, message.channel);
            }
            return;
        }

        // Handle captcha answers in DMs
        psql.find_one(psql.Captcha, message.author)
            .then((c: psql.Captcha) => {
                if (!c) {
                    message.channel.send(
                        "An active captcha was not found for you."
                    );
                    return;
                }

                const expires = new Date(c.createdAt);
                expires.setDate(expires.getDate() + 1);
                if (expires < new Date()) {
                    message.channel.send(
                        "Your captcha has expired, please request a new one."
                    );
                    return;
                }

                const parsed_content = parseFloat(
                    message.content.replace(/,/, ".")
                ).toFixed(1);
                if (c.answer === parsed_content) {
                    c.update({ completed: true, active: false });

                    psql.find_one(psql.Quiz, message.author).then(
                        (q: psql.Quiz) => {
                            const completed = q.completed + 1;
                            q.update({ completed: completed });

                            if (completed >= 3) {
                                user.addRole(write_role);
                                const usr_str = `<${user.user.username}:${user.id}>`;
                                const role_str = `<${write_role.name}:${write_role.id}>`;
                                log(
                                    `Added write role ${role_str} to user ${usr_str}`
                                );
                                message.channel.send(
                                    `\`${parsed_content}\` is correct. You've been given write permissions to the relevant channels.`
                                );
                                return;
                            } else {
                                message.channel.send(
                                    `\`${parsed_content}\` is correct. You've completed ${completed}/3 captchas.`
                                );
                            }

                            psql.Captcha.findOne({
                                where: {
                                    [Op.and]: [
                                        {
                                            quiz_id: q.id,
                                            completed: false,
                                            active: false,
                                        },
                                    ],
                                },
                            }).then((c: psql.Captcha) => {
                                c.update({ active: true }).then(
                                    (c: psql.Captcha) => {
                                        user.send(
                                            "",
                                            make_captcha_message(
                                                c,
                                                make_github_issue_suffix(c)
                                            )
                                        );
                                        log(
                                            `Sent captcha to user ${user.id} with answer ${c.answer}`
                                        );
                                    }
                                );
                            });
                        }
                    );
                } else {
                    psql.find_one(psql.Quiz, message.author).then(
                        (q: psql.Quiz) => {
                            const wrong = q.wrong + 1;
                            q.update({ wrong: wrong });

                            if (wrong >= 5) {
                                psql.Captcha.update(
                                    { active: false },
                                    { where: { user_id: user.id } }
                                ).then(() => {
                                    message.channel.send(
                                        `\`${parsed_content}\` is not correct. You've failed and may try again in 24 hours.`
                                    );
                                });
                            } else {
                                message.channel.send(
                                    `\`${parsed_content}\` is not correct. You've used ${wrong}/5 incorrect answers.`
                                );
                            }
                        }
                    );
                }
            })
            .catch((error) => {
                log(error.stack, LoggingLevel.ERR);
                message.channel.send(
                    "An error occurred while looking for your captcha."
                );
            });
    });

    // Authenticate.
    discord_client.login(dicord_token).catch(handle_exception);
})();
