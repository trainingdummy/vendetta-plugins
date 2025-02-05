import { findByName, findByProps, instead, after } from "@vendetta/patcher";
import { constants, React } from "@vendetta/metro/common";
import HiddenChannel from "./HiddenChannel";
import { lazyDestructure, findByProps } from "@vendetta/metro";

let patches: Array<() => void> = [];

// Lookup modules for permissions and channel retrieval.
const Permissions = findByProps("getChannelPermissions", "can");
const Router = findByProps("transitionToGuild");
const Fetcher = findByProps("stores", "fetchMessages");
const { ChannelTypes } = findByProps("ChannelTypes");
const { getChannel } = findByProps("getChannel");

// Define channel types that should be skipped.
const skipChannels = [
  ChannelTypes.DM,
  ChannelTypes.GROUP_DM,
  ChannelTypes.GUILD_CATEGORY
];

/**
 * isHidden determines whether a channel should be considered hidden.
 * If a string is provided, it resolves it via getChannel.
 */
function isHidden(channel: any | undefined): boolean {
  if (!channel) return false;
  if (typeof channel === "string") channel = getChannel(channel);
  if (!channel || skipChannels.includes(channel.type)) return false;
  // Tag the channel so our patched Permissions.can knows it's under test.
  channel.realCheck = true;
  const res = !Permissions.can(constants.Permissions.VIEW_CHANNEL, channel);
  delete channel.realCheck;
  console.log(`isHidden: channel ${channel?.id} hidden? ${res}`);
  return res;
}

/**
 * onLoad patches the messages container component.
 * We search for candidate modules, and if one is found, patch its render.
 * If none is found, we log an error but do not disable the plugin.
 */

function onLoad() {
    const candidates = [
        "MessagesWrapperConnected",
        "ChannelReader",
        "MessagesList",
        "ChannelMessages"
    ];
    
    let targetComponent = null;

    for (const name of candidates) {
        targetComponent = lazyDestructure(() => findByProps(name));
        if (targetComponent) {
            console.log(`Hidden Channels plugin: Found candidate component: ${name}`);
            break;
        } else {
            console.log(`Hidden Channels plugin: Candidate ${name} not found.`);
        }
    }

    if (!targetComponent) {
        console.error("Hidden Channels plugin: No suitable messages component found. Plugin enabled but will not patch UI.");
    } else {
        patches.push(
            instead("default", targetComponent, (args, orig) => {
                const channel = args[0]?.channel;
                if (!isHidden(channel) && typeof orig === "function") {
                    return orig(...args);
                } else {
                    console.log("Hidden Channels plugin: Rendering HiddenChannel UI for channel:", channel?.id);
                    return React.createElement(HiddenChannel, { channel });
                }
            })
        );
    }
}


/**
 * onUnload unpatches all applied patches.
 */
function onUnload() {
  for (const unpatch of patches) {
    unpatch();
  }
}

export default {
  onLoad,
  onUnload
};
