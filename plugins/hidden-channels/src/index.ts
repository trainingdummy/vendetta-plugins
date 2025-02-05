import { findByProps, findByName } from "@vendetta/metro";
import { constants, React } from "@vendetta/metro/common";
import { instead, after } from "@vendetta/patcher";
import HiddenChannel from "./HiddenChannel";

let patches = [];
let visibilityState = {};

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

function isHidden(channel) {
    if (!channel) return false;
    if (typeof channel === 'string') channel = getChannel(channel);
    if (!channel || skipChannels.includes(channel.type)) return false;
    channel.realCheck = true;
    let res = !Permissions.can(constants.Permissions.VIEW_CHANNEL, channel);
    delete channel.realCheck;
    return res;
}

function onLoad() {
    const ChannelMessages = findByName("ChannelMessages", false) || findByProps("ChannelMessages");
    if (!ChannelMessages) {
        console.error("Hidden Channels plugin: 'ChannelMessages' module not found.");
        return;
    }

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

    patches.push(instead("default", ChannelMessages, (args, orig) => {
        const channel = args[0]?.channel;
        if (!isHidden(channel) && typeof orig === "function") return orig(...args);
        else return React.createElement(HiddenChannel, {channel});
    }));
}

function onUnload() {
    for (const unpatch of patches) {
        unpatch();
    }
    // Additional cleanup logic if needed
}

export default {
    onLoad,
    onUnload
};
