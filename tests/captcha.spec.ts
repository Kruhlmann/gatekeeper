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

const noorc_th = {
    type: "axe",
    subtype: "2 handed",
    skill: 300,
}

const noorc_dw = {
    type: "axe",
    subtype: "dual wielded",
    skill: 300,
}

const scenarios = {
    hit: {
        orc: {
            th: { ...orc_scenario_template, weapon: orc_th },
            dw: { ...orc_scenario_template, weapon: orc_dw },
        },
        noorc: {
            th: { ...noorc_scenario_template, weapon: noorc_th },
            dw: { ...noorc_scenario_template, weapon: noorc_dw },
        }
    },
};

describe("CAPTCHAs", () => {
    describe("Hit chance", () => {
        describe("Orc", () => {
            describe("Front", () => {
                describe("White hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 6.0", () => {
                            const scenario = scenarios.hit.orc.th;
                            const answer = hit_cap_generator(scenario, "none", false, true).answer;
                            expect(answer).to.equal("6.0");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 25.0", () => {
                            const scenario = scenarios.hit.orc.dw;
                            const answer = hit_cap_generator(scenario, "none", false, true).answer;
                            expect(answer).to.equal("25.0");
                        });
                    });
                });

                describe("Yellow hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 6.0", () => {
                            const scenario = scenarios.hit.orc.th;
                            const answer = hit_cap_generator(scenario, "none", true, true).answer;
                            expect(answer).to.equal("6.0");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 6.0", () => {
                            const scenario = scenarios.hit.orc.dw;
                            const answer = hit_cap_generator(scenario, "none", true, true).answer;
                            expect(answer).to.equal("6.0");
                        });
                    });
                });
            });

            describe("Behind", () => {
                describe("White hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 6.0", () => {
                            const scenario = scenarios.hit.orc.th;
                            const answer = hit_cap_generator(scenario, "none", false, false).answer;
                            expect(answer).to.equal("6.0");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 25.0", () => {
                            const scenario = scenarios.hit.orc.dw;
                            const answer = hit_cap_generator(scenario, "none", false, false).answer;
                            expect(answer).to.equal("25.0");
                        });
                    });
                });

                describe("Yellow hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 6.0", () => {
                            const scenario = scenarios.hit.orc.th;
                            const answer = hit_cap_generator(scenario, "none", true, false).answer;
                            expect(answer).to.equal("6.0");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 6.0", () => {
                            const scenario = scenarios.hit.orc.dw;
                            const answer = hit_cap_generator(scenario, "none", true, false).answer;
                            expect(answer).to.equal("6.0");
                        });
                    });
                });
            });
        });

        describe("Non-orc", () => {
            describe("Front", () => {
                describe("Yellow hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 9.0", () => {
                            const scenario = scenarios.hit.noorc.th;
                            const answer = hit_cap_generator(scenario, "none", true, true).answer;
                            expect(answer).to.equal("9.0");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 9.0", () => {
                            const scenario = scenarios.hit.noorc.dw;
                            const answer = hit_cap_generator(scenario, "none", true, true).answer;
                            expect(answer).to.equal("9.0");
                        });
                    });
                });

                describe("White hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 9.0", () => {
                            const scenario = scenarios.hit.noorc.th;
                            const answer = hit_cap_generator(scenario, "none", false, true).answer;
                            expect(answer).to.equal("9.0");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 28.0", () => {
                            const scenario = scenarios.hit.noorc.dw;
                            const answer = hit_cap_generator(scenario, "none", false, true).answer;
                            expect(answer).to.equal("28.0");
                        });
                    });
                });
            });

            describe("Behind", () => {
                describe("Yellow hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 9.0", () => {
                            const scenario = scenarios.hit.noorc.th;
                            const answer = hit_cap_generator(scenario, "none", true, false).answer;
                            expect(answer).to.equal("9.0");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 9.0", () => {
                            const scenario = scenarios.hit.noorc.dw;
                            const answer = hit_cap_generator(scenario, "none", true, false).answer;
                            expect(answer).to.equal("9.0");
                        });
                    });
                });

                describe("White hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 9.0", () => {
                            const scenario = scenarios.hit.noorc.th;
                            const answer = hit_cap_generator(scenario, "none", false, false).answer;
                            expect(answer).to.equal("9.0");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 28.0", () => {
                            const scenario = scenarios.hit.noorc.dw;
                            const answer = hit_cap_generator(scenario, "none", false, false).answer;
                            expect(answer).to.equal("28.0");
                        });
                    });
                });
            });
        });
    });

    describe("Parry", () => {
        describe("Orc", () => {
            it("should have the answer X", () => {
                expect(1).to.equal(1);
                // 13.5 need to verify with magey if weapon skill applies to parry
            });
        });
        describe("Non-orc", () => {
            it("should have the answer X", () => {
                expect(1).to.equal(1);
                // 14
            });
        });
    });

    describe("Dodge", () => {
        describe("Orc", () => {
            it("should have the answer 6.0", () => {
                const scenario = scenarios.hit.orc.th;
                const answer = hit_cap_generator(scenario, "dodge", false, false).answer;
                expect(answer).to.equal("6.0");
            });
        });
        describe("Non-orc", () => {
            it("should have the answer 6.5", () => {
                const scenario = scenarios.hit.noorc.th;
                const answer = hit_cap_generator(scenario, "dodge", false, false).answer;
                expect(answer).to.equal("6.5");
            });
        });
    });

    describe("Block", () => {
        describe("Orc", () => {
            it("should have the answer 5.0", () => {
                const scenario = scenarios.hit.orc.th;
                const answer = hit_cap_generator(scenario, "block", false, false).answer;
                expect(answer).to.equal("5.0");
            });
        });
        describe("Non-orc", () => {
            it("should have the answer 5.0", () => {
                const scenario = scenarios.hit.noorc.th;
                const answer = hit_cap_generator(scenario, "block", false, false).answer;
                expect(answer).to.equal("5.0");
            });
        });
    });

    describe("Glancing", () => {
        describe("Orc", () => {
            it("should have the answer 40.0", () => {
                const scenario = scenarios.hit.orc.th;
                const answer = hit_cap_generator(scenario, "glancing", false, false).answer;
                expect(answer).to.equal("40.0");
            });
        });
        describe("Non-orc", () => {
            it("should have the answer 40.0", () => {
                const scenario = scenarios.hit.noorc.th;
                const answer = hit_cap_generator(scenario, "glancing", false, false).answer;
                expect(answer).to.equal("40.0");
            });
        });
    });
});

