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

    patches.push(instead("default", ChannelMessages, (args, orig) => {
        const channel = args[0]?.channel;
        if (!isHidden(channel) && typeof orig === "function") return orig(...args);

        // Apply muted channel class and padlock icon to hidden channels
        return React.createElement(HiddenChannel, {
            channel,
            className: 'modeMuted__2ea32', // Apply muted channel class
            children: [
                // Replace lock icon with a padlock icon
                React.createElement('svg', {
                    className: 'ic_lock', // This is the padlock icon
                    viewBox: '0 0 24 24',
                    width: '24',
                    height: '24',
                    fill: 'none'
                }, 
                React.createElement('path', {
                    fill: 'currentColor',
                    d: 'M18 10v4h-2V7a4 4 0 0 0-8 0v7H6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2zM12 7a2 2 0 0 1 2 2v7h-4V9a2 2 0 0 1 2-2z'
                }))
            ]
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
