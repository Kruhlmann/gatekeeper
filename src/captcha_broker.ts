/**
 * @fileoverview Function library for sending out captchas
 * @author Andreas Kruhlmann
 * @since 1.0.0
 */

import * as discord from "discord.js";
import * as captcha_generator from "./captchas";
import * as psql from "./db";
import { Captcha } from "./typings/types";
import { log } from "./io";
import { LoggingLevel } from "./typings/types";

export const captcha_preface =
    "__**Fight Club Gatekeeping**__\n\nWelcome to the Fight Club Classic Warrior discord.\n\nMost channels in this discord are for **serious** theorycrafting and as such we ask you to please answer the questions below, if you want write priviledges, to verify that you have at least some basic knowledge about the warrior class.\n\nYou can find the answer to your question if you throroughly read through the frequently asked questions channels.";

export function make_github_issue_suffix(captcha: psql.Captcha): string {
    return (
        `\n\n*Experiencing problems with my programming? [Open an issue](https://github.com/Kruhlmann/gatekeeper/issues/new?assignees=Kruhlmann&labels=bug&template=captcha-issue.md&title=%5BCAPTCHA%5D)*` +
        `\nYour ID: \`${captcha.quiz_id}\\${captcha.id}\``
    );
}

/**
 * Returns 3 unique hit cap captchas.
 *
 * @return - Array length 3 with distinct git cap captchas,
 */
export function get_unique_captchas(): Captcha[] {
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
export function make_captcha_message(
    captcha: Captcha,
    suffix: string
): discord.RichEmbed {
    return new discord.RichEmbed()
        .setTitle("Fight Club Captcha")
        .setDescription(captcha.text + suffix)
        .setThumbnail(
            "https://img.rankedboost.com/wp-content/uploads/2019/05/WoW-Classic-Warrior-Guide-150x150.png"
        );
}

/**
 * Registers a CAPTCHA in the database.
 *
 * @async
 * @param quiz_id - ID of associated quiz.
 * @param user_id - Discord ID of user.
 * @param text - CAPTCHA prompt.
 * @param answer - Answer to CAPTCHA.
 * @param active - State of the CAPTCHA.
 * @returns - Created CAPTCHA object.
 */
export async function create_captcha(
    quiz_id: string,
    user_id: string,
    text: string,
    answer: string,
    active: boolean
): Promise<psql.Captcha> {
    return psql.Captcha.create({
        quiz_id,
        user_id,
        text,
        answer,
        active,
    });
}

async function update_quiz(user: discord.GuildMember): Promise<psql.Quiz> {
    console.log(1);
    return psql.Quiz.update({ active: false }, { where: { user_id: user.id } })
        .then(async () => {
            console.log(2);
            await psql.Captcha.update(
                { active: false },
                { where: { user_id: user.id } }
            );
            return psql.Quiz.create({
                user_id: user.id,
                active: true,
            });
        })
        .catch((e) => {
            console.error(e);
            return null;
        });
}

/**
 * Finalizes, then sends a captcha.
 *
 * @param user - User to send captcha to.
 * @param preface - Text preface for the discord embed message.
 * @param captcha - Captcha to generate an embed message for.
 */
async function send_captcha(
    user: discord.GuildMember,
    preface: string,
    captcha: psql.Captcha
): Promise<void> {
    const suffix = make_github_issue_suffix(captcha);
    const captcha_embed = make_captcha_message(captcha, suffix);
    await user.send(preface, captcha_embed);
    log(`Sent captcha to user ${user.id} with answer ${captcha.answer}`);
}

/**
 * Simplifies the code for making captchas depending on whether it is the first
 * to be created as this has special behavior.
 *
 * @param quiz - The quiz for the captcha.
 * @param user - The user who the quiz belongs to.
 * @param captcha - Captcha data object.
 * @param is_first - Whether this captcha will be the first to be generated for
 * this quiz. If it is it will be sent out to the user immediately.
 */
function make_captcha_wrapper(
    quiz: psql.Quiz,
    user: discord.GuildMember,
    captcha: Captcha,
    is_first: boolean
): void {
    const captcha_promise = create_captcha(
        quiz.id,
        user.id,
        captcha.text,
        captcha.answer,
        is_first
    );
    if (is_first) {
        captcha_promise.then((database_captcha: psql.Captcha) => {
            send_captcha(user, captcha_preface, database_captcha);
        });
    }
}

/**
 * Sends a captcha to a user to allow them to optain write permissions.
 *
 * @param user - User to send captcha to.
 * @param channel - Channel to send error output to should one occur.
 */
export async function generate_and_send_captcha(
    user: discord.GuildMember,
    channel: discord.Channel
): Promise<void> {
    try {
        const quiz = await update_quiz(user);
        let first = true;
        for (let captcha of get_unique_captchas()) {
            make_captcha_wrapper(quiz, user, captcha, first);
            first = false;
        }
    } catch (error) {
        on_send_captcha_error(error, channel as discord.TextChannel, user);
    }
}

/**
 * Error handling for functions sending captchas. Logs the erorr and notifies
 * the user who was to recieve the message.
 *
 * @param error - Error caught.
 * @param channel - Channel where the sending of a captcha threw an error.
 * @param user - The user which was to recieve the message.
 */
function on_send_captcha_error(
    error: Error,
    channel: discord.TextChannel,
    user: discord.GuildMember
): void {
    log(
        `Error when sending captcha to user ${user.user.username}:${user.id}: ${error}`,
        LoggingLevel.ERR
    );
    channel.send(`Sorry <@${user.id}>, I can't send you a message.`);
}
