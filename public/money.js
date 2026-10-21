(function (root, factory) {
    const money = factory();
    if (typeof module === "object" && module.exports) module.exports = money;
    else root.GrocerMoney = money;
})(typeof globalThis === "object" ? globalThis : this, function () {
    "use strict";
    // Estimates use thousandths so binary floating-point tails cannot turn an
    // exact budget into an apparent overspend. Stored unit prices are untouched.
    const round = (value) => Math.round((value + Number.EPSILON) * 1000) / 1000;
    const lineTotal = (item) => (item.price === null ? 0 : round(item.price * item.quantity));
    const total = (items) => round(items.reduce((sum, item) => sum + lineTotal(item), 0));
    const validAmount = (value) =>
        typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1e9;
    const validQuantity = (value) => Number.isSafeInteger(value) && value >= 1 && value <= 1e6;
    return { round, lineTotal, total, validAmount, validQuantity };
});
