/**
 * @fileoverview Main entry point for application.
 * @author Andreas Kruhlmann
 * @since 1.0.0
 */

import * as discord from "discord.js";
import { handle_exception, log } from "./io";
import { LoggingLevel } from "./typings/types.js";
import * as config from "../config.json";

process.on("uncaughtException", handle_exception);
process.on("unhandledRejection", handle_exception);

(async () => {
    // Init discord virtual client.
    const discord_client = new discord.Client();
    const dicord_token = config.deployment_mode === "production"
        ? config.discord_bot_token.production
        : config.discord_bot_token.development;

    log("Awaiting response from discord", LoggingLevel.DEV);
    discord_client.on("ready", () => {
        log(`Started gatekeeper in ${config.deployment_mode} mode`);
    });

    discord_client.on("message", (message: discord.Message) => {
        message.author.send("xd");
    });

    discord_client.on("guildMemberAdd", (user: discord.GuildMember) => {
        const guild = user.guild;
        if (guild.id !== config.guild_id) {
            return;
        }

        console.log(Object.keys(guild.roles)

    });


    // Authenticate.
    discord_client.login(dicord_token).catch(handle_exception);
})();
