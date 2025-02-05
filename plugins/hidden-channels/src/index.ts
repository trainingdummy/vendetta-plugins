import { findByName, findByProps } from "@vendetta/metro";

export function onLoad() {
    console.log("[Hidden Channels Debug] Debug script loading...");

    setTimeout(() => {
        const ChannelMessages = findByName("ChannelMessages", false) || findByProps("ChannelMessages");
        
        if (ChannelMessages) {
            console.log("[Hidden Channels Debug] ChannelMessages found ✅");
            console.log("[Hidden Channels Debug] ChannelMessages properties:", Object.keys(ChannelMessages));

            if (ChannelMessages.default) {
                console.log("[Hidden Channels Debug] ChannelMessages.default found ✅");
                console.log("[Hidden Channels Debug] ChannelMessages.default properties:", Object.keys(ChannelMessages.default));

                if (ChannelMessages.default._channelMessages) {
                    console.log("[Hidden Channels Debug] ChannelMessages.default._channelMessages found ✅");
                    console.log("[Hidden Channels Debug] _channelMessages type:", typeof ChannelMessages.default._channelMessages);
                    console.log("[Hidden Channels Debug] _channelMessages properties:", Object.keys(ChannelMessages.default._channelMessages));
                } else {
                    console.log("[Hidden Channels Debug] _channelMessages not found ❌");
                }
            }
        } else {
            console.log("[Hidden Channels Debug] ChannelMessages not found ❌");
        }

        console.log("[Hidden Channels Debug] Debug script loaded successfully!");
    }, 10000); // 10-second delay

}

export function onUnload() {
    console.log("[Hidden Channels Debug] Debug script unloaded.");
}
