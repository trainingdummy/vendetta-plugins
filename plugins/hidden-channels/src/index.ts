import { findByName, findByProps } from "@vendetta/metro";
import { constants, React } from "@vendetta/metro/common";
import { instead, after } from "@vendetta/patcher";
import HiddenChannel from "./HiddenChannel";

// Store unpatch functions here so we can clean up on unload.
let patches: Array<() => void> = [];

// Look up necessary modules using Vendetta’s API helpers.
// If any of these lookups fail, log an error and (optionally) fail gracefully.
const Permissions = findByProps("getChannelPermissions", "can");
const Router = findByProps("transitionToGuild");
const Fetcher = findByProps("stores", "fetchMessages");

// Extract ChannelTypes and getChannel from their modules.
const ChannelModule = findByProps("ChannelTypes");
const { ChannelTypes } = ChannelModule || { ChannelTypes: {} };
const ChannelGetter = findByProps("getChannel");
const { getChannel } = ChannelGetter || { getChannel: (id: string) => null };

// We'll use a WeakMap to mark channels during our permission check,
// avoiding direct mutation of the channel object.
const realCheckMap = new WeakMap<any, boolean>();

// Define channel types to skip – these channels should not be hidden.
const skipChannels = [
  ChannelTypes.DM,
  ChannelTypes.GROUP_DM,
  ChannelTypes.GUILD_CATEGORY
];

/**
 * Determines if a channel is hidden.
 * If the channel is passed as a string, it is resolved via getChannel.
 * For channels not in skipChannels, we temporarily mark the channel in our map,
 * run the permission check, and then clear the mark.
 */
function isHidden(channel: any | undefined): boolean {
  if (!channel) return false;
  if (typeof channel === "string") {
    channel = getChannel(channel);
  }
  if (!channel || skipChannels.includes(channel.type)) return false;

  // For debugging: log channel properties
  console.log("isHidden: checking channel", channel.id, channel.name, channel.type);

  // For testing: force a hidden condition if the channel's name includes 'serious'
  if (channel.name && channel.name.toLowerCase().includes("serious")) {
    console.log("isHidden: forcing hidden for channel with name", channel.name);
    return true;
  }

  // The original permission-checking logic
  channel.realCheck = true;
  let res = !Permissions.can(constants.Permissions.VIEW_CHANNEL, channel);
  delete channel.realCheck;
  console.log("isHidden: result from Permissions.can for channel", channel.id, ":", res);
  return res;
}

/**
 * onLoad: sets up all patches.
 * We patch:
 *  - Permissions.can to override the VIEW_CHANNEL check when needed.
 *  - Router.transitionToGuild to block navigation if a channel is hidden.
 *  - Fetcher.fetchMessages to block message fetching for hidden channels.
 *  - The render function of MessagesWrapperConnected so that a HiddenChannel element is shown if the channel is hidden.
 */
function onLoad() {
  // Look up the Messages component we want to patch.
  const MessagesConnected = findByName("MessagesWrapperConnected", false);
  if (!MessagesConnected) {
    console.error("Hidden Channels plugin: 'MessagesWrapperConnected' component not found");
    return;
  }

  // Patch the permission check.
  patches.push(
    after("can", Permissions, ([permID, channel], result) => {
      // If our channel is flagged and we're checking VIEW_CHANNEL, force the permission to be granted.
      if (realCheckMap.get(channel) && permID === constants.Permissions.VIEW_CHANNEL) {
        return true;
      }
      return result;
    })
  );

  // Patch navigation: only allow transitioning if the channel is not hidden.
  patches.push(
    instead("transitionToGuild", Router, (args, original) => {
      const [, channel] = args;
      if (!isHidden(channel) && typeof original === "function") {
        original(args);
      }
    })
  );

  // Patch message fetching: only fetch messages if the channel is not hidden.
  patches.push(
    instead("fetchMessages", Fetcher, (args, original) => {
      const [channel] = args;
      if (!isHidden(channel) && typeof original === "function") {
        original(args);
      }
    })
  );

  // Patch the render function of the Messages component.
  patches.push(
    instead("default", MessagesConnected, (args, original) => {
      // We assume the first argument contains the channel data.
      const channel = args[0]?.channel;
      if (!isHidden(channel) && typeof original === "function") {
        return original(...args);
      } else {
        // If hidden, render our custom HiddenChannel component.
        return React.createElement(HiddenChannel, { channel });
      }
    })
  );
}

/**
 * onUnload: cleans up all patches.
 */
function onUnload() {
  patches.forEach(unpatch => unpatch());
  patches = [];
}

export default {
  onLoad,
  onUnload,
};
