// Test-only upstream stub. Incoming requests still use real HTTP and SQLite.
const seen = new Set();
global.fetch = async (url) => {
    const target = new URL(url);
    if (target.hostname !== "nominatim.openstreetmap.org")
        throw new Error("Unexpected external request");
    if (
        target.searchParams.get("zoom") !== "13" ||
        target.searchParams.get("layer") !== "address"
    ) {
        throw new Error("Settlement-level address detail was not requested");
    }
    const lat = target.searchParams.get("lat");
    if (!/^[-\d]+\.\d{2}$/.test(lat)) throw new Error("Coordinates were not rounded");
    if (seen.has(lat)) throw new Error("Cached location was fetched a second time");
    seen.add(lat);
    const settlements = {
        "-30.00": { city: "Cape Town", town: "Must not override city" },
        "-31.00": { town: "Stellenbosch" },
        "-32.00": { village: "Franschhoek" },
        "-33.00": { municipality: "Example Municipality" },
        "-34.00": { county: "Must not pretend county is a city" },
    };
    if (!Object.hasOwn(settlements, lat)) throw new Error("Simulated service outage");
    return {
        ok: true,
        json: async () => ({
            address: {
                country_code: "za",
                country: "South Africa",
                ...settlements[lat],
            },
        }),
    };
};
const app = require("../server");
const server = app.listen(0, "127.0.0.1", () => process.send({ port: server.address().port }));
