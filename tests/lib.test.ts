import { t_diff } from "../src/time";

describe("Time diff functionality", () => {
    const now = new Date();

    it("should have an empty string on equal dates", () => {
        expect(t_diff(now, now)).toBe("");
    });

    it("should recognice difference in hours", () => {
        const d_tmp = new Date(now.getTime());
        d_tmp.setHours(now.getHours() + 9);
        expect(t_diff(now, d_tmp)).toBe("9 hour(s)");
        expect(t_diff(d_tmp, now)).toBe("9 hour(s)");
    });

    it("should recognice difference in minutes", () => {
        const d_tmp = new Date(now.getTime());
        d_tmp.setMinutes(now.getMinutes() + 45);
        expect(t_diff(now, d_tmp)).toBe("45 minute(s)");
        expect(t_diff(d_tmp, now)).toBe("45 minute(s)");
    });

    it("should recognice difference in seconds", () => {
        const d_tmp = new Date(now.getTime());
        d_tmp.setSeconds(now.getSeconds() + 29);
        expect(t_diff(now, d_tmp)).toBe("29 second(s)");
        expect(t_diff(d_tmp, now)).toBe("29 second(s)");
    });
});
