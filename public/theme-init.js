try {
    document.documentElement.dataset.theme =
        localStorage.getItem("grocerglow.theme") === "dark" ? "dark" : "light";
} catch {
    document.documentElement.dataset.theme = "light";
}
