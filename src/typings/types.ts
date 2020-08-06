export enum LoggingLevel {
    DEV = 0,
    INF = 1,
    WAR = 2,
    ERR = 3,
}

export type Scenario = {
    sex: string;
    race: string;
    sex_prefix: string;
    guild_name: string;
};

export type CombatScenario = {
    sex: string;
    race: string;
    sex_prefix: string;
    guild_name: string;
    weapon: Weapon;
    target: Target;
    skill_delta: number;
};

export type Captcha = {
    answer: number;
    description: string;
    example: number;
};

export type Target = {
    name: string;
    level: number;
    defense: number;
};

export type Weapon = {
    type: string;
    subtype: string;
    skill: number;
};
