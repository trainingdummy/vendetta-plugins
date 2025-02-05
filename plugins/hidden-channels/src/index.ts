import { findByName, findByProps } from "@vendetta/metro";

export function onLoad() {
    console.log("[Hidden Channels Debug] Debug script loading...");

    const possibleModules = [
        "MessagesWrapperConnected",
        "ChannelMessages",
        "MessageActionCreators",
        "MessagePreviewStore",
        "GuildBasicChannels",
        "ChannelStore"
    ];

    for (const mod of possibleModules) {
        const found = findByName(mod, false) || findByProps(mod);
        console.log(`[Hidden Channels Debug] ${mod}:`, found ? "Found ✅" : "Not Found ❌");

        if (found) {
            console.log(`[Hidden Channels Debug] ${mod} properties:`, Object.keys(found));
        }
    }

    console.log("[Hidden Channels Debug] Debug script loaded successfully!");
}

export function onUnload() {
    console.log("[Hidden Channels Debug] Debug script unloaded.");
}
