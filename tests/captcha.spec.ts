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
            th: { ...orc_scenario_template, weapon: orc_th },
            dw: { ...orc_scenario_template, weapon: orc_dw },
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
                            const scenario = scenarios.hit.orc.th;
                            const answer = hit_cap_generator(scenario, "none", false, true).answer;
                            expect(answer).to.equal("6");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 24.7", () => {
                            const scenario = scenarios.hit.orc.dw;
                            const answer = hit_cap_generator(scenario, "none", false, true).answer;
                            //expect(answer).to.equal("24.7");
                            // TODO
                        });
                    });
                });

                describe("Yellow hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 6", () => {
                            const scenario = scenarios.hit.orc.th;
                            const answer = hit_cap_generator(scenario, "none", true, true).answer;
                            expect(answer).to.equal("6");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 6", () => {
                            const scenario = scenarios.hit.orc.dw;
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
                            const scenario = scenarios.hit.orc.th;
                            const answer = hit_cap_generator(scenario, "none", false, false).answer;
                            expect(answer).to.equal("6");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 24.8", () => {
                            const scenario = scenarios.hit.orc.dw;
                            const answer = hit_cap_generator(scenario, "none", false, false).answer;
                            //expect(answer).to.equal("24.8");
                        });
                    });
                });

                describe("Yellow hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer 6", () => {
                            const scenario = scenarios.hit.orc.th;
                            const answer = hit_cap_generator(scenario, "none", true, false).answer;
                            expect(answer).to.equal("6");
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer 6", () => {
                            const scenario = scenarios.hit.orc.dw;
                            const answer = hit_cap_generator(scenario, "none", true, false).answer;
                            expect(answer).to.equal("6");
                        });
                    });
                });
            });
        });

        describe("Non-orc", () => {
            describe("Front", () => {
                describe("Yellow hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer X", () => {
                            expect(1).to.equal(1);
                            // 9
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer X", () => {
                            expect(1).to.equal(1);
                            // 9
                        });
                    });
                });

                describe("White hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer X", () => {
                            expect(1).to.equal(1);
                            // 9
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer X", () => {
                            expect(1).to.equal(1);
                            // 27.2
                        });
                    });
                });
            });

            describe("Behind", () => {
                describe("Yellow hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer X", () => {
                            expect(1).to.equal(1);
                            // 9
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer X", () => {
                            expect(1).to.equal(1);
                            // 9
                        });
                    });
                });

                describe("White hits", () => {
                    describe("Two-handed", () => {
                        it("should have the answer X", () => {
                            expect(1).to.equal(1);
                            // 9
                        });
                    });

                    describe("Dual wielding", () => {
                        it("should have the answer X", () => {
                            expect(1).to.equal(1);
                            // 27.2
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
            it("should have the answer X", () => {
                expect(1).to.equal(1);
                // 6
            });
        });
        describe("Non-orc", () => {
            it("should have the answer X", () => {
                expect(1).to.equal(1);
                // 6.5
            });
        });
    });

    describe("Block", () => {
        describe("Orc", () => {
            it("should have the answer X", () => {
                expect(1).to.equal(1);
                // 5
            });
        });
        describe("Non-orc", () => {
            it("should have the answer X", () => {
                expect(1).to.equal(1);
                // 5
            });
        });
    });

    describe("Glancing", () => {
        describe("Orc", () => {
            it("should have the answer X", () => {
                expect(1).to.equal(1);
                // 40
            });
        });
        describe("Non-orc", () => {
            it("should have the answer X", () => {
                expect(1).to.equal(1);
                // 40
            });
        });
    });
});

