import { findByName, findByProps } from "@vendetta/metro";
import { constants, React } from "@vendetta/metro/common";
import { instead, after } from "@vendetta/patcher";
import HiddenChannel from "./HiddenChannel";

let patches = [];

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
    if (channel == undefined) return false;
    if (typeof channel === 'string')
        channel = getChannel(channel);
    if (!channel || skipChannels.includes(channel.type)) return false;

    channel.realCheck = true;
    const res = !Permissions.can(constants.Permissions.VIEW_CHANNEL, channel);
    delete channel.realCheck;
    return res;
}

export function onLoad() {
    console.log("[Hidden Channels Debug] onLoad started");

    // Find and log the ChannelMessages module (check for hidden channels here)
    const ChannelMessages = findByName("ChannelMessages", false) || findByProps("ChannelMessages");
    if (ChannelMessages) {
        console.log("[Hidden Channels Debug] ChannelMessages found");

        const _channelMessages = ChannelMessages?.default?._channelMessages;
        if (_channelMessages) {
            const channelIds = Object.keys(_channelMessages);
            console.log("[Hidden Channels Debug] Channel IDs found:", channelIds);

            // Loop through channel IDs and check for hidden ones
            for (const channelId of channelIds) {
                const channel = _channelMessages[channelId];
                if (isHidden(channel)) {
                    console.log("[Hidden Channels Debug] Hidden channel found:", channelId);
                    // Render HiddenChannel UI for hidden channels
                    React.createElement(HiddenChannel, { channel });
                }
            }
        } else {
            console.log("[Hidden Channels Debug] _channelMessages not found in ChannelMessages");
        }
    } else {
        console.log("[Hidden Channels Debug] ChannelMessages not found");
    }

    // Apply patches for channel permission handling
    patches.push(after("can", Permissions, ([permID, channel], res) => {
        if (!channel?.realCheck && permID === constants.Permissions.VIEW_CHANNEL) return true;
        return res;
    }));

    patches.push(instead("transitionToGuild", Router, (args, orig) => {
        const [_, channel] = args;
        if (!isHidden(channel) && typeof orig === "function") orig(args);
    }));

    patches.push(instead("fetchMessages", Fetcher, (args, orig) => {
        const [channel] = args;
        if (!isHidden(channel) && typeof orig === "function") orig(args);
    }));

    patches.push(instead("default", MessagesConnected, (args, orig) => {
        const channel = args[0]?.channel;
        if (!isHidden(channel) && typeof orig === "function") return orig(...args);
        else return React.createElement(HiddenChannel, { channel });
    }));
}

export default {
    onLoad,
    onUnload: () => {
        console.log("[Hidden Channels Debug] onUnload called.");
        for (const unpatch of patches) unpatch();
        patches = [];
    }
}
