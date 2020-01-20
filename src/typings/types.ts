export enum LoggingLevel {
    DEV = 0,
    INF = 1,
    WAR = 2,
    ERR = 3,
}

export interface Scenario {
    sex: string;
    race: string;
    sex_prefix: string;
    guild_name: string;
}

export interface CombatScenario {
    sex: string;
    race: string;
    sex_prefix: string;
    guild_name: string;
    weapon: {
        type: string;
        subtype: string;
        skill: number;
    };
    target: {
        name: string;
        level: number;
        defense: number;
    };
    skill_delta: number;
}

export interface Captcha {
    answer: string;
    text: string;
}
