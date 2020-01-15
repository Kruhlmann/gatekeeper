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
 * Sends a captcha to a user to allow them to optain write permissions.
 *
 * @param user - User to send captcha to.
 */
export function send_captcha(
    user: discord.GuildMember,
    channel: discord.Channel
) {
    try {
        psql.Quiz.update(
            { active: false },
            { where: { user_id: user.id } }
        ).then(() => {
            psql.Captcha.update(
                { active: false },
                { where: { user_id: user.id } }
            ).then(() => {
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
                                user.send(
                                    captcha_preface,
                                    make_captcha_message(
                                        c,
                                        make_github_issue_suffix(c)
                                    )
                                );
                                log(
                                    `Sent captcha to user ${user.id} with answer ${captcha.answer}`
                                );
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
                    }
                });
            });
        });
    } catch (e) {
        log(
            `Error when sending captcha to user ${user.user.username}:${user.id}: ${e}`,
            LoggingLevel.ERR
        );
        (channel as discord.TextChannel).send(
            `Sorry <@${user.id}>, I can't send you a message.`
        );
    }
}
