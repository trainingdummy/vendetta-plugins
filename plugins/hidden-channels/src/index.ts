import { findByName, findByProps } from "@vendetta/metro";
import { constants, React } from "@vendetta/metro/common";
import { instead, after } from "@vendetta/patcher";
import HiddenChannel from "./HiddenChannel";  // Ensure this file exists and is properly defined.

let patches = [];

// Find core modules necessary for operation
const Permissions = findByProps("getChannelPermissions", "can");
const Router = findByProps("transitionToGuild");
const Fetcher = findByProps("stores", "fetchMessages");
const { ChannelTypes } = findByProps("ChannelTypes");
const { getChannel } = findByProps("getChannel");

const skipChannels = [
    ChannelTypes.DM, 
    ChannelTypes.GROUP_DM, 
    ChannelTypes.GUILD_CATEGORY
];

function isHidden(channel: any | undefined) {
    if (!channel) return false;
    if (typeof channel === 'string') channel = getChannel(channel);
    if (!channel || skipChannels.includes(channel.type)) return false;

    channel.realCheck = true;
    const res = !Permissions.can(constants.Permissions.VIEW_CHANNEL, channel);
    delete channel.realCheck;
    return res;
}

export function onLoad() {
    console.log("[Hidden Channels Debug] Plugin loading...");

    // Check for MessagesWrapperConnected module
    const MessagesConnected = findByName("MessagesWrapperConnected", false);
    if (!MessagesConnected) {
        console.error("[Hidden Channels Debug] MessagesWrapperConnected not found!");
        return;
    }
    console.log("[Hidden Channels Debug] MessagesWrapperConnected found");

    // Check for ChannelMessages module and handle it
    const ChannelMessages = findByName("ChannelMessages", false) || findByProps("ChannelMessages");
    if (ChannelMessages) {
        console.log("[Hidden Channels Debug] ChannelMessages found");

        const _channelMessages = ChannelMessages?.default?._channelMessages;
        if (_channelMessages) {
            const channelIds = Object.keys(_channelMessages);
            console.log("[Hidden Channels Debug] Found channel IDs:", channelIds);

            // Loop through the channel IDs and check if they are hidden
            for (const channelId of channelIds) {
                const channel = _channelMessages[channelId];
                if (isHidden(channel)) {
                    console.log("[Hidden Channels Debug] Hidden channel found:", channelId);
                    // If the channel is hidden, render the HiddenChannel UI
                    React.createElement(HiddenChannel, { channel });
                }
            }
        } else {
            console.log("[Hidden Channels Debug] _channelMessages not found in ChannelMessages");
        }
    } else {
        console.log("[Hidden Channels Debug] ChannelMessages not found");
    }

    // Patch permissions
    patches.push(after("can", Permissions, ([permID, channel], res) => {
        if (!channel?.realCheck && permID === constants.Permissions.VIEW_CHANNEL) return true;
        return res;
    }));

    // Patch router behavior to prevent navigation to hidden channels
    patches.push(instead("transitionToGuild", Router, (args, orig) => {
        const [_, channel] = args;
        if (!isHidden(channel) && typeof orig === "function") orig(args);
    }));

    // Patch message fetching to avoid fetching from hidden channels
    patches.push(instead("fetchMessages", Fetcher, (args, orig) => {
        const [channel] = args;
        if (!isHidden(channel) && typeof orig === "function") orig(args);
    }));

    // Patch message rendering to show HiddenChannel UI for hidden channels
    patches.push(instead("default", MessagesConnected, (args, orig) => {
        const channel = args[0]?.channel;
        if (!isHidden(channel) && typeof orig === "function") return orig(...args);
        else return React.createElement(HiddenChannel, { channel });
    }));

    console.log("[Hidden Channels Debug] Plugin loaded successfully.");
}

export default {
    onLoad,
    onUnload: () => {
        console.log("[Hidden Channels Debug] Plugin unloading...");
        for (const unpatch of patches) unpatch();
        patches = [];
    }
}
