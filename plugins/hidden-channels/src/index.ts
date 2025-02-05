import { findByName, findByProps, instead, after } from "@vendetta/patcher";
import { constants, React } from "@vendetta/metro/common";
import HiddenChannel from "./HiddenChannel";

let patches = [];

// Lookup internal modules for permissions and channel retrieval.
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

/**
 * Checks whether a given channel is hidden.
 * If a string is provided, it resolves it via getChannel.
 */
function isHidden(channel: any | undefined): boolean {
  if (channel == undefined) return false;
  if (typeof channel === "string") channel = getChannel(channel);
  if (!channel || skipChannels.includes(channel.type)) return false;
  
  // Tag the channel so that the patched Permissions.can will treat it differently.
  channel.realCheck = true;
  let res = !Permissions.can(constants.Permissions.VIEW_CHANNEL, channel);
  delete channel.realCheck;
  
  // Debug log:
  console.log(`isHidden: channel ${channel?.id} hidden? ${res}`);
  return res;
}

function onLoad() {
  // Look up the original messages container component.
  const MessagesConnected = findByName("MessagesWrapperConnected", false);
  if (!MessagesConnected) {
    console.error("Hidden Channels plugin: 'MessagesWrapperConnected' component not found");
    return;
  }
  
  // Patch Permissions.can to force view permission when our check is in effect.
  patches.push(after("can", Permissions, ([permID, channel], res) => {
    if (!channel?.realCheck && permID === constants.Permissions.VIEW_CHANNEL) return true;
    return res;
  }));
  
  // Patch Router.transitionToGuild to block navigation if the channel is hidden.
  patches.push(instead("transitionToGuild", Router, (args, orig) => {
    const [_, channel] = args;
    if (!isHidden(channel) && typeof orig === "function") {
      orig(args);
    } else {
      console.log("Blocked transition to hidden channel:", channel?.id);
    }
  }));
  
  // Patch Fetcher.fetchMessages to block message fetching for hidden channels.
  patches.push(instead("fetchMessages", Fetcher, (args, orig) => {
    const [channel] = args;
    if (!isHidden(channel) && typeof orig === "function") {
      orig(args);
    } else {
      console.log("Blocked fetching messages for hidden channel:", channel?.id);
    }
  }));
  
  // Patch the default render of the messages container.
  patches.push(instead("default", MessagesConnected, (args, orig) => {
    const channel = args[0]?.channel;
    if (!isHidden(channel) && typeof orig === "function") {
      return orig(...args);
    } else {
      console.log("Rendering HiddenChannel UI for channel:", channel?.id);
      return React.createElement(HiddenChannel, { channel });
    }
  }));
}

export default {
  onLoad,
  onUnload: () => {
    for (const unpatch of patches) {
      unpatch();
    }
  }
};
