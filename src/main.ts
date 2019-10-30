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

function remove_chromosomes(collection: Map<string, any>) {
    return Object.fromEntries(collection.entries())
}

function purge_routine(guild: discord.Guild, read_role: discord.Role) {
    guild.members.forEach((user) => {
        const has_role = !!user.roles.find((role) => role.id === read_role.id);
        if (!has_role) {
            user.addRole(read_role);
            log(`Added read role to user <${user.user.username}:${user.id}>`);
        }
    });
}

(async () => {
    // Init discord virtual client.
    const discord_client = new discord.Client();
    const dicord_token = config.deployment_mode === "production"
        ? config.discord_bot_token.production
        : config.discord_bot_token.development;

    log("Awaiting response from discord", LoggingLevel.DEV);

    discord_client.on("ready", () => {
        log(`Started gatekeeper in ${config.deployment_mode} mode`);
        const guild = discord_client.guilds.get(config.guild_id)
        const read_role = guild.roles.get(config.role_id)
        // TODO
        purge_routine(guild, read_role)
        //setInterval(() => purge_routine(discord_client), 1000)
    });

    discord_client.on("message", (message: discord.Message) => {
        const channel = message.channel;

        if (channel.type == "text") {
            const guild = (channel as discord.TextChannel).guild;

            if (guild.id !== config.guild_id) {
                return;
            }

            const roles = guild.roles;
            console.log(JSON.stringify(Object.keys(discord_client.guilds), null, 4))

        }

    });

    discord_client.on("guildMemberAdd", (user: discord.GuildMember) => {
        const guild = user.guild;
        if (guild.id !== config.guild_id) {
            return;
        }
        console.log(Object.keys(guild.roles));
    });

    // Authenticate.
    discord_client.login(dicord_token).catch(handle_exception);
})();
