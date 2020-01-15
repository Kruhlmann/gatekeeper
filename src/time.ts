/**
 * @fileoverview Timespan functions.
 * @author Kruhlmann
 * @since 1.0.0
 */

export function t_diff(d1: Date, d2: Date) {
    const diff = Math.abs(d2.getTime() - d1.getTime()) / 1000; // In seconds.
    const h_diff = Math.floor(diff / 3600);
    const m_diff = Math.floor((diff - h_diff * 3600) / 60);
    const s_diff = Math.floor(diff % 60);
    const h_str = h_diff > 0 ? ` ${h_diff} hour(s)` : "";
    const m_str = m_diff > 0 ? ` ${m_diff} minute(s)` : "";
    const s_str = s_diff > 0 ? ` ${s_diff} second(s)` : "";
    return `${h_str}${m_str}${s_str}`.trim();
}

