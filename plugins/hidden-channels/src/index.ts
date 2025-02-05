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

                // Check each channel ID
                const hiddenChannelIDs = ChannelMessages.default._channelMessages;
                console.log("[Hidden Channels Debug] Hidden channel IDs:", hiddenChannelIDs);

                // This is where we identify the channels using the IDs
                hiddenChannelIDs.forEach(channelID => {
                    console.log("[Hidden Channels Debug] Checking channel ID:", channelID);

                    // Look for the channel by ID
                    const channel = findByProps(channelID);
                    if (channel) {
                        console.log("[Hidden Channels Debug] Hidden channel found:", channel);
                    } else {
                        console.log("[Hidden Channels Debug] Channel not found:", channelID);
                    }
                });
            }
        } else {
            console.log("[Hidden Channels Debug] ChannelMessages not found ❌");
        }

        console.log("[Hidden Channels Debug] Debug script loaded successfully!");
    }, 1000); // Delay to ensure modules are loaded
}

export function onUnload() {
    console.log("[Hidden Channels Debug] Debug script unloaded.");
}
