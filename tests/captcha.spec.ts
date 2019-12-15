import { expect } from "chai";
import { hit_cap_generator } from "../src/captchas";
import "mocha";

const scenario_template = {
    sex: "female",
    sex_prefix: "",
    guild_name: "",
    target: {
        name: "",
        level: 63,
        defense: 315,
    },
};

const orc_scenario_template = {
    ...scenario_template,
    race: "orc",
    skill_delta: 10,
};

const orc_th = {
    type: "axe",
    subtype: "2 handed",
    skill: 305,
};

const orc_dw = {
    type: "axe",
    subtype: "dual wielded",
    skill: 305,
};

const noorc_scenario_template = {
    ...scenario_template,
    race: "troll",
    skill_delta: 15,
}

const troll_th = {
    type: "axe",
    subtype: "2 handed",
    skill: 300,
}

const troll_dw = {
    type: "axe",
    subtype: "dual wielded",
    skill: 300,
}

const scenarios = {
    hit: {
        orc: {
            front: {
                white: {
                    th: { ...orc_scenario_template, weapon: orc_th },
                    dw: { ...orc_scenario_template, weapon: orc_dw },
                },
                yellow: {},
            },
            behind: {
                white: {},
                yellow: {},
            },
        },
        noorc: {

        }
    },
};

describe("CAPTCHAs", () => {
    describe("Hit chance", () => {
        describe("Orc", () => {
            describe("Front", () => {
                describe("White hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 6", () => {
                            const scenario = scenarios.hit.orc.front.white.th;
                            const answer = hit_cap_generator(scenario, "none", false, true).answer;
                            expect(answer).to.equal("6");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 24.7", () => {
                            const scenario = scenarios.hit.orc.front.white.dw;
                            const answer = hit_cap_generator(scenario, "none", false, true).answer;
                            //expect(answer).to.equal("24.7");
                            // TODO
                        });
                    });
                });

                describe("Yellow hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 6", () => {
                            const scenario = scenarios.hit.orc.front.white.th;
                            const answer = hit_cap_generator(scenario, "none", true, true).answer;
                            expect(answer).to.equal("6");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 6", () => {
                            const scenario = scenarios.hit.orc.front.white.dw;
                            const answer = hit_cap_generator(scenario, "none", true, true).answer;
                            expect(answer).to.equal("6");
                        });
                    });
                });
            });

            describe("Behind", () => {
                describe("White hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 6", () => {
                            const scenario = scenarios.hit.orc.front.white.th;
                            const answer = hit_cap_generator(scenario, "none", false, false).answer;
                            expect(answer).to.equal("6");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 24.7", () => {
                            const scenario = scenarios.hit.orc.front.white.dw;
                            const answer = hit_cap_generator(scenario, "none", false, false).answer;
                            //expect(answer).to.equal("24.7");
                            // TODO
                        });
                    });
                });

                describe("Yellow hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 6", () => {
                            const scenario = scenarios.hit.orc.front.white.th;
                            const answer = hit_cap_generator(scenario, "none", true, false).answer;
                            expect(answer).to.equal("6");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 6", () => {
                            const scenario = scenarios.hit.orc.front.white.dw;
                            const answer = hit_cap_generator(scenario, "none", true, false).answer;
                            expect(answer).to.equal("6");
                        });
                    });
                });
            });
        });

        describe("Non-orc", () => {
        });
    });
});

