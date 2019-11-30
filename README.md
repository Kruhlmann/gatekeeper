# Gatekeeper discord bot

[![Discord Server](https://img.shields.io/discord/572880907682447380%20.svg?logo=discord&style=for-the-badge)](https://discord.gg/38wH62F)
[![Build Status](https://img.shields.io/travis/Kruhlmann/gatekeeper.svg?style=for-the-badge)](https://travis-ci.org/Kruhlmann/gatekeeper)
[![Maintainability](https://img.shields.io/codeclimate/maintainability/Kruhlmann/gatekeeper.svg?style=for-the-badge)](https://codeclimate.com/github/Kruhlmann/gatekeeper/maintainability)

## Setup

<p align="center">
  <a href="https://discordapp.com/oauth2/authorize?client_id=637062618535821312&scope=bot&permissions=268435456">
    <img src="doc/connect.png" />
  </a>
</p>

To invite the bot click [this link](https://discordapp.com/oauth2/authorize?client_id=637062618535821312&scope=bot&permissions=268435456) (or the image above) as the server owner. Invite the bot to the server of your choice and, if necessary, promote it to allow for administrative tasks.

## Usage

### Local setup

#### Dependencies

If you want to run your own instance of the bot the following packages are required:

* gcc
* autoconf
* libtool
* build-essential
* make
* automake
* nodejs
* npm
* postgres >=11

The following packages are recomended:

* pm2 `npm i -g pm2`

You must rename [config.json.example](config.json.example) to `config.json` and fill it in with the required details. 

#### Environment variables

* `GATEKEEPER_DB_USR` postgres database user
* `GATEKEEPER_DB_PWD` postgres database user password
* `GATEKEEPER_DB_NAM` postgres database name
