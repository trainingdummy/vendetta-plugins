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

            if (ChannelMessages.default && ChannelMessages.default._channelMessages) {
                console.log("[Hidden Channels Debug] _channelMessages found ✅");

                // Check the list of hidden channel IDs
                const hiddenChannelIDs = ChannelMessages.default._channelMessages;
                console.log("[Hidden Channels Debug] Hidden channel IDs:", hiddenChannelIDs);
                
                // Just log the IDs and stop here for now
                hiddenChannelIDs.forEach(channelID => {
                    console.log("[Hidden Channels Debug] Channel ID:", channelID);
                });
            } else {
                console.log("[Hidden Channels Debug] No _channelMessages property found ❌");
            }
        } else {
            console.log("[Hidden Channels Debug] ChannelMessages not found ❌");
        }

        console.log("[Hidden Channels Debug] Debug script loaded successfully!");
    }, 10000); // Delay to ensure modules are loaded
}

export function onUnload() {
    console.log("[Hidden Channels Debug] Debug script unloaded.");
}
