"use strict";

// A per-process cache is appropriate for one local instance. Deployments with
// multiple processes need a shared provider cache/rate limiter before use.
function createLocationHandler(supportedCurrencies) {
    const cache = new Map();
    const lifetime = 24 * 60 * 60 * 1000;
    let lastLookup = 0;
    let inFlight = false;
    return async (req, res) => {
        const { latitude, longitude } = req.body;
        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            Math.abs(latitude) > 90 ||
            Math.abs(longitude) > 180
        ) {
            return res.status(400).json({ error: "Invalid coordinates." });
        }
        const lat = latitude.toFixed(2),
            lon = longitude.toFixed(2);
        const key = `${lat},${lon}`;
        for (const [entry, location] of cache) {
            if (Date.now() - location.savedAt > lifetime) cache.delete(entry);
        }
        let location = cache.get(key);
        try {
            if (!location) {
                if (inFlight || Date.now() - lastLookup < 1100) {
                    return res
                        .set("Retry-After", "2")
                        .status(429)
                        .json({ error: "Please wait a moment and try again." });
                }
                inFlight = true;
                lastLookup = Date.now();
                try {
                    // Configurable without a software update if the provider asks us to move.
                    const url = new URL(
                        process.env.GROCERGLOW_GEOCODER_URL ||
                            "https://nominatim.openstreetmap.org/reverse",
                    );
                    if (url.protocol !== "https:") throw new Error("Geocoder must use HTTPS");
                    for (const [name, value] of Object.entries({
                        format: "jsonv2",
                        lat,
                        lon,
                        zoom: "13",
                        layer: "address",
                        addressdetails: "1",
                    }))
                        url.searchParams.set(name, value);
                    const response = await fetch(url, {
                        headers: {
                            "User-Agent":
                                "GrocerGlow/1.0 (https://github.com/Markus2401/GrocerGlow)",
                            Accept: "application/json",
                        },
                        signal: AbortSignal.timeout(10000),
                    });
                    if (!response.ok) throw new Error("Geocoder request failed");
                    const { address } = await response.json();
                    const countryCode =
                        typeof address?.country_code === "string"
                            ? address.country_code.toUpperCase()
                            : null;
                    if (!countryCode)
                        return res.status(422).json({ error: "Country could not be identified." });
                    const city =
                        [address.city, address.town, address.village, address.hamlet]
                            .find((value) => typeof value === "string" && value.trim())
                            ?.trim() || null;
                    location = {
                        countryCode,
                        country:
                            typeof address.country === "string" ? address.country : countryCode,
                        city,
                        savedAt: Date.now(),
                    };
                    if (cache.size >= 200) cache.delete(cache.keys().next().value);
                    cache.set(key, location);
                } finally {
                    inFlight = false;
                }
            }
            // Import lazily inside the handler: loading errors are handled and do
            // not create an unhandled rejected promise at application startup.
            const { default: currencyMap } = await import("country-to-currency");
            const currency = currencyMap[location.countryCode];
            if (typeof currency !== "string" || !supportedCurrencies.has(currency)) {
                return res
                    .status(422)
                    .json({ error: "No supported currency was found for this country." });
            }
            res.json({
                country: location.country,
                countryCode: location.countryCode,
                city: location.city,
                currency,
            });
        } catch (error) {
            console.error("Location service unavailable:", error.name);
            res.status(502).json({
                error: "Location service unavailable. Choose a currency manually.",
            });
        }
    };
}

module.exports = { createLocationHandler };
