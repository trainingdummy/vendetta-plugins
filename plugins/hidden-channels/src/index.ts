import { findByName, findByProps, instead } from "@vendetta/patcher";
import { constants, React } from "@vendetta/metro/common";
import HiddenChannel from "./HiddenChannel";

// Store unpatch functions for cleanup.
const patches: Array<() => void> = [];

// Assume ChannelReader is the new correct messages component.
const ChannelReader = findByName("ChannelReader", false);
if (!ChannelReader) {
  console.error("Hidden Channels plugin: 'ChannelReader' component not found");
}

// Lookup necessary modules for permissions and channel info.
const Permissions = findByProps("getChannelPermissions", "can");
const { ChannelTypes } = findByProps("ChannelTypes");
const { getChannel } = findByProps("getChannel");

// List channel types that should be skipped (not considered hidden).
const skipChannels = [
  ChannelTypes.DM,
  ChannelTypes.GROUP_DM,
  ChannelTypes.GUILD_CATEGORY
];

/**
 * Determines whether a channel should be considered hidden.
 * If a channel is passed as a string, it resolves it first.
 */
function isHidden(channel: any | undefined): boolean {
  if (!channel) return false;
  if (typeof channel === "string") channel = getChannel(channel);
  if (!channel || skipChannels.includes(channel.type)) return false;
  // Tag the channel temporarily for our permission patch.
  channel.realCheck = true;
  const canView = Permissions.can(constants.Permissions.VIEW_CHANNEL, channel);
  delete channel.realCheck;
  return !canView;
}

/**
 * onLoad: patches ChannelReader's default render.
 * If the channel is hidden, it replaces the UI with HiddenChannel.
 */
function onLoad() {
  if (!ChannelReader) return;
  
  patches.push(
    instead("default", ChannelReader, (args, orig) => {
      const channel = args[0]?.channel;
      // Use the original render if the channel isn't hidden.
      if (!isHidden(channel) && typeof orig === "function") {
        return orig(...args);
      } else {
        // Otherwise, render our custom HiddenChannel component.
        return React.createElement(HiddenChannel, { channel });
      }
    })
  );
}

/**
 * onUnload: Reverts all patches when the plugin is disabled.
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
