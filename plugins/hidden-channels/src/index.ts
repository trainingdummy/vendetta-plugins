import { findByName, findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";
import HiddenChannel from "./HiddenChannel";

let patches = [];

// Find ChannelMessages
export function onLoad() {
    console.log("[Hidden Channels Debug] Debug script loading...");

    setTimeout(() => {
        const ChannelMessages = findByName("ChannelMessages", false) || findByProps("ChannelMessages");

        if (ChannelMessages) {
            console.log("[Hidden Channels Debug] ChannelMessages found ✅");

            // Log the properties of ChannelMessages.default safely
            if (ChannelMessages.default) {
                console.log("[Hidden Channels Debug] ChannelMessages.default properties:", Object.keys(ChannelMessages.default));
                console.log("[Hidden Channels Debug] ChannelMessages.default:", ChannelMessages.default);
            } else {
                console.log("[Hidden Channels Debug] ChannelMessages.default is undefined ❌");
            }
        } else {
            console.log("[Hidden Channels Debug] ChannelMessages not found ❌");
        }

        console.log("[Hidden Channels Debug] Debug script loaded successfully!");
    }, 10000); // Delay for 10 seconds to ensure modules are loaded
}

export function onUnload() {
    console.log("[Hidden Channels Debug] Debug script unloaded.");
}
