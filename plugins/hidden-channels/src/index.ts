import { findByName, findByProps } from "@vendetta/metro";

export function onLoad() {
    console.log("[Hidden Channels Debug] Debug script loading...");

    setTimeout(() => {
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

                // Check if there's a "default" property and log its keys too
                if (found.default) {
                    console.log(`[Hidden Channels Debug] ${mod}.default properties:`, Object.keys(found.default));
                }
            }
        }

        console.log("[Hidden Channels Debug] Debug script loaded successfully!");
    }, 1000); // 1-second delay

}

export function onUnload() {
    console.log("[Hidden Channels Debug] Debug script unloaded.");
}
