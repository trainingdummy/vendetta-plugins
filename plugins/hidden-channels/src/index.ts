import { findByName, findByProps } from "@vendetta/metro";
import { constants, React } from "@vendetta/metro/common";
import { instead, after } from "@vendetta/patcher";
import HiddenChannel from "./HiddenChannel";

let patches = [];

// Get necessary Vendetta modules
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

// Function to check if the channel is hidden
function isHidden(channel: any | undefined) {
    if (channel == undefined) return false;
    if (typeof channel === 'string')
        channel = getChannel(channel);
    if (!channel || skipChannels.includes(channel.type)) return false;
    channel.realCheck = true;
    let res = !Permissions.can(constants.Permissions.VIEW_CHANNEL, channel);
    delete channel.realCheck;
    return res;
}

// Define the dark gray color used for muted channels
const mutedColor = "#72767d";  // Typically, muted channels use a gray like this

function onLoad() {
    const ChannelMessages = findByName("ChannelMessages", false) || findByProps("ChannelMessages");
    if (!ChannelMessages) {
        console.error("Hidden Channels plugin: 'ChannelMessages' module not found.");
        return;
    }
    
    console.log("[Hidden Channels Debug] ChannelMessages:", ChannelMessages);

    // Patching methods for controlling behavior
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
        
        // Remove unread formatting and set to dark gray
        const style = {
            color: mutedColor,
            opacity: 0.6, // optional: to make it appear dimmer, like muted channels
        };

        return React.createElement(HiddenChannel, {
            channel,
            icon: "ic_lock",  // Use padlock icon instead of locked # icon
            style,            // Apply muted gray styling
        });
    }));
}

export default {
    onLoad,
    onUnload: () => {
        for (const unpatch of patches) {
            unpatch();
        };
    }
}
