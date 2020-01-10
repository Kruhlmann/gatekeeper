/**
 * @fileoverview Main entry point for application.
 * @author Andreas Kruhlmann
 * @since 1.0.0
 */

import * as discord from "discord.js";
import { handle_exception, log } from "./io";
import { LoggingLevel } from "./typings/types";
import * as config from "../config.json";
import * as captcha_generator from "./captchas";
import * as psql from "./db";
import { Op } from "sequelize";
import * as Sentry from "@sentry/node";
import { Captcha } from "./typings/types";

const req_env_vars = [
    "GATEKEEPER_DB_USR",
    "GATEKEEPER_DB_PWD",
    "GATEKEEPER_DB_NAM",
    "GATEKEEPER_DISCORD_TOKEN",
];

// Global exception handling.
process.on("uncaughtException", handle_exception);
process.on("unhandledRejection", handle_exception);

const captcha_preface = "__**Fight Club Gatekeeping**__\n\nWelcome to the Fight Club Classic Warrior discord.\n\nMost channels in this discord are for **serious** theorycrafting and as such we ask you to please answer the questions below, if you want write priviledges, to verify that you have at least some basic knowledge about the warrior class.\n\nYou can find the answer to your question if you throroughly read through the frequently asked questions channels."

let db: psql.DB;

/**
 * Returns 3 unique hit cap captchas.
 *
 * @return - Array length 3 with distinct git cap captchas,
 */
function get_unique_captchas(): Captcha[] {
    const captchas = [];
    const generators = [...captcha_generator.generators];
    for (let i = 0; i < 3; i++) {
        const generator_index = Math.floor(Math.random() * generators.length);
        const generator = generators[generator_index];
        generators.splice(generator_index, 1);
        const captcha = generator();
        captchas.push(captcha);
    }
    return captchas;
}

/**
 * Contructs a rich embed discord message from a captcha.
 *
 * @param captcha - Captcha to generate message from.
 * @returns - Discord rich embed message.
 */
function make_captcha_message(captcha: Captcha, suffix: string): discord.RichEmbed {
    return new discord.RichEmbed()
        .setTitle("Fight Club Captcha")
        .setDescription(captcha.text + suffix)
        .setThumbnail("https://img.rankedboost.com/wp-content/uploads/2019/05/WoW-Classic-Warrior-Guide-150x150.png");
}

function make_github_issue_suffix(captcha: psql.Captcha): string {
    return `\n\n*Experiencing problems with my programming? [Open an issue](https://github.com/Kruhlmann/gatekeeper/issues/new?assignees=Kruhlmann&labels=bug&template=captcha-issue.md&title=%5BCAPTCHA%5D)*` +
    `\nYour ID: \`${captcha.quiz_id}\\${captcha.id}\``;
}

/**
 * Sends a captcha to a user to allow them to optain write permissions.
 *
 * @param user - User to send captcha to.
 */
function send_captcha(user: discord.GuildMember) {
    psql.Quiz.update({
        active: false
    },{
        where: { user_id: user.id }
    }).then(() => {

        psql.Captcha.update({
            active: false
        },{
            where: { user_id: user.id }
        }).then(() => {

            psql.Quiz.create({
                user_id: user.id,
                active: true,
            }).then((q: psql.Quiz) => {

                let first = true;
                for (let captcha of get_unique_captchas()) {
                    if (first) {
                        psql.Captcha.create({
                            quiz_id: q.id,
                            user_id: user.id,
                            text: captcha.text,
                            answer: captcha.answer,
                            active: true,
                        }).then((c: psql.Captcha) => {
                            user.send(captcha_preface, make_captcha_message(c, make_github_issue_suffix(c)));
                            log(`Sent captcha to user ${user.id} with answer ${captcha.answer}`);
                        });
                    } else {
                        psql.Captcha.create({
                            quiz_id: q.id,
                            user_id: user.id,
                            text: captcha.text,
                            answer: captcha.answer,
                            active: false,
                        });
                    }
                    first = false;
                };

            });
        });

    });
}

/**
 * Adds the default read-only role to all members without it.
 *
 * @param guild - Guild to apply read role to.
 * @param read_role - Role to apply to members.
 */
function role_routine(guild: discord.Guild, read_role: discord.Role): void {
    guild.members.forEach((user) => {
        const has_read_role = !!user.roles.find((role) => {
            return role.id === read_role.id;
        });

        if (!has_read_role) {
            user.addRole(read_role);
            const usr_str = `<${user.user.username}:${user.id}>`;
            const role_str = `<${read_role.name}:${read_role.id}>`;
            log(`Added read role ${role_str} to user ${usr_str}`);
        }
    });
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
            log(`Missing environment variable: ${env_var}`, LoggingLevel.ERR)
            valid = false;
        } else {
            log(`Found required environment variable ${env_var}`, LoggingLevel.DEV)
        }
    }

    return valid;
}

// Main fucntion.
(async () => {
    // Check for all environment variables.
    if(!validate_environment(req_env_vars)) {
        process.exit(1);
    }

    if (process.env.hasOwnProperty("GATEKEEPER_SENTRY_DSN")) {
        Sentry.init({ dsn: process.env.GATEKEEPER_SENTRY_DSN });
    } else {
        log("No sentry DSN provided. Sentry logging is disabled.", LoggingLevel.WAR)
    }

    // Init discord virtual client.
    const discord_client = new discord.Client();
    const dicord_token = process.env.GATEKEEPER_DISCORD_TOKEN;

    // Init database.
    db = psql.connect()

    log("Awaiting response from discord", LoggingLevel.DEV);

    discord_client.on("ready", () => {
        log(`Started gatekeeper in ${config.deployment_mode} mode`);

        const guild = discord_client.guilds.get(config.guild_id);
        const read_role = guild.roles.get(config.role_ids.read);

        role_routine(guild, read_role);
        setInterval(() => role_routine(guild, read_role), 5000);
    });

    discord_client.on("message", (message: discord.Message) => {
        // Ignore our own messages
        if (message.author.id === discord_client.user.id) {
            return;
        }

        const guild = discord_client.guilds.get(config.guild_id);
        const user = guild.members.get(message.author.id);
        const write_role = guild.roles.get(config.role_ids.write);
        const has_write_role = !!user.roles.find((role) => {
            return role.id === config.role_ids.write;
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
                psql.Quiz.findOne({
                    order: ["createdAt"],
                    where: {
                        [Op.and]: [{ user_id: user.id }, { active: true }],
                    },
                }).then((quiz) => {
                    if (quiz) {
                        const created = new Date(quiz.createdAt);
                        const expires = new Date(created.getTime() + 24 * 60 * 60 * 1000)
                        if (expires >= new Date()) {
                            message.reply("You already have a pending captcha. You can request a new one 24 hours after the active captcha was requested.");
                        }
                    } else {
                        send_captcha(user);
                    }
                });
            } else {
                send_captcha(user);
            }
            return;
        }

        // Handle captcha answers in DMs
        psql.Captcha.findOne({
            where: {
                [Op.and]: [{ user_id: message.author.id }, { active: true }]
            }
        }).then((c: psql.Captcha) => {
            if (!c) {
                message.channel.send("An active captcha was not found for you.");
                return;
            }

            const created = new Date(c.createdAt);
            const expires = new Date(created.getTime() + 24 * 60 * 60 * 1000);
            if (expires < new Date()) {
                message.channel.send("Your captcha has expired, please request a new one.");
                return;
            }

            const parsed_content = parseFloat(message.content)
            if (c.answer === parsed_content.toFixed(1)) {
                c.update({ completed: true, active: false });

                psql.Quiz.findOne({
                    where: {
                        [Op.and]: [{ user_id: message.author.id }, { active: true }]
                    }
                }).then((q: psql.Quiz) => {
                    const completed = q.completed+1;
                    q.update({completed: completed});

                    if (completed >= 3) {
                        user.addRole(write_role);
                        const usr_str = `<${user.user.username}:${user.id}>`;
                        const role_str = `<${write_role.name}:${write_role.id}>`;
                        log(`Added write role ${role_str} to user ${usr_str}`);
                        message.channel.send(`\`${message.content}\` is correct. You've been given write permissions to the relevant channels.`);
                        return;
                    } else {
                        message.channel.send(`\`${message.content}\` is correct. You've completed ${completed}/3 captchas.`);
                    }

                    psql.Captcha.findOne({
                        where: {
                            [Op.and]: [{ quiz_id: q.id, completed: false, active: false }]
                        }
                    }).then((c: psql.Captcha) => {
                        c.update({active: true}).then((c: psql.Captcha) => {
                            user.send('', make_captcha_message(c, make_github_issue_suffix(c)))
                            log(`Sent captcha to user ${user.id} with answer ${c.answer}`);
                        });
                    });
                });
            } else {
                psql.Quiz.findOne({
                    where: {
                        [Op.and]: [{ user_id: message.author.id }, { active: true }]
                    }
                }).then((q: psql.Quiz) => {
                    const wrong = q.wrong+1;
                    q.update({wrong: wrong});

                    if (wrong >= 5) {
                        psql.Captcha.update({
                            active: false
                        },{
                            where: { user_id: user.id }
                        }).then(() => {
                            message.channel.send(`\`${message.content}\` is not correct. You've failed and may try again in 24 hours.`);
                        });
                    } else {
                        message.channel.send(`\`${message.content}\` is not correct. You've used ${wrong}/5 incorrect answers.`);
                    }
                });
            }
        }).catch((error) => {
            log(error.stack, LoggingLevel.ERR);
            message.channel.send("An error occurred while looking for your captcha.");
        });
    });

    // Authenticate.
    discord_client.login(dicord_token).catch(handle_exception);
})();

