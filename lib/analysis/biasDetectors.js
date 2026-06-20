"use strict";
// lib/analysis/biasDetectors.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectRecencyChasing = detectRecencyChasing;
exports.detectCompulsiveChecking = detectCompulsiveChecking;
exports.detectConfirmationSeeking = detectConfirmationSeeking;
/**
 * 1. "Recency chasing" detector
 * Triggers if the user added a stock to their watchlist within the last 24h
 * and either:
 *  - The stock's daily change percent at the time of add was >= 5%
 *  - The price at add was >= 5% higher than the price at a previous view of this stock within 24h prior to the add.
 */
function detectRecencyChasing(symbol, events) {
    const adds = events?.watchlistAdds || [];
    if (adds.length === 0)
        return null;
    // Evaluate the most recent add
    const latestAdd = adds[adds.length - 1];
    const now = Date.now();
    // Must have occurred within the last 24 hours
    if (now - latestAdd.timestamp > 24 * 60 * 60 * 1000) {
        return null;
    }
    // Condition A: Daily price jump of >= 5% when added
    const dailyJump = latestAdd.changePercent >= 5;
    // Condition B: Added after it moved >= 5% compared to any view in the prior 24h
    let priorViewJump = false;
    const views = events.views || [];
    for (const view of views) {
        const timeDiff = latestAdd.timestamp - view.timestamp;
        // View must be in the 24 hours prior to the watchlist add
        if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
            if (view.price > 0) {
                const movement = (latestAdd.price - view.price) / view.price;
                if (movement >= 0.05) {
                    priorViewJump = true;
                    break;
                }
            }
        }
    }
    if (dailyJump || priorViewJump) {
        return {
            id: `recency_chasing_${symbol}`,
            type: 'recency_chasing',
            symbol,
            severity: 'low',
            detectedAt: latestAdd.timestamp,
        };
    }
    return null;
}
/**
 * 2. "Compulsive checking" detector
 * Triggers if the user has viewed the same stock 5+ times in a single day (24 hours).
 */
function detectCompulsiveChecking(symbol, sessionViews, views) {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    // Filter views within last 24 hours
    const recentViews = (views || []).filter((v) => v.timestamp >= oneDayAgo);
    if (recentViews.length >= 5) {
        const latestView = recentViews[recentViews.length - 1];
        return {
            id: `compulsive_checking_${symbol}`,
            type: 'compulsive_checking',
            symbol,
            severity: 'low', // Gentle severity
            detectedAt: latestView.timestamp,
        };
    }
    return null;
}
/**
 * 3. "Confirmation seeking" detector
 * Triggers if the user only adds stocks to the watchlist when the signal is Bullish
 * (needs at least 5 watchlist additions in total, and all must be Bullish).
 */
function detectConfirmationSeeking(events) {
    const allAdds = [];
    for (const symbol of Object.keys(events)) {
        const symbolAdds = events[symbol]?.watchlistAdds || [];
        allAdds.push(...symbolAdds);
    }
    if (allAdds.length < 5) {
        return null;
    }
    // Check if every watchlist add had a 'Bullish' signal (case-insensitive or normalized)
    const allBullish = allAdds.every((add) => add.signal === 'Bullish');
    if (allBullish) {
        // Sort to find the latest add to use as detectedAt
        allAdds.sort((a, b) => b.timestamp - a.timestamp);
        return {
            id: 'confirmation_seeking_global',
            type: 'confirmation_seeking',
            severity: 'low',
            detectedAt: allAdds[0].timestamp,
        };
    }
    return null;
}
