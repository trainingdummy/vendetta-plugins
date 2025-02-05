import { findByName, findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";
import HiddenChannel from "./HiddenChannel";

let patches = [];

const possibleModules = [
    "MessagesWrapperConnected",
    "ChannelMessages",
    "MessageActionCreators",
    "MessagePreviewStore",
    "GuildBasicChannels",
    "ChannelStore"
];

// Function to find the module safely
function findModule(moduleNames: string[]) {
    for (const mod of moduleNames) {
        const found = vendetta.modules.findByName(mod, false) || vendetta.modules.findByProps(mod);
        console.log(`[Hidden Channels Debug] ${mod}:`, found);
    }
}

export function onLoad() {
    // Find modules
    findModule(possibleModules);

    setTimeout(() => {
        const ChannelMessages = findByName("ChannelMessages", false) || findByProps("ChannelMessages");

        if (ChannelMessages) {
            console.log("[Hidden Channels Debug] ChannelMessages found ✅");

            // Access the _channelMessages object
            const _channelMessages = ChannelMessages.default?._channelMessages;
            if (_channelMessages) {
                const channelIds = Object.keys(_channelMessages);
                console.log("[Hidden Channels Debug] Channel IDs found:", channelIds);

                // Check for hidden channels and render HiddenChannel UI
                for (const channelId of channelIds) {
                    const channel = _channelMessages[channelId];
                    if (isHidden(channel)) {
                        console.log("[Hidden Channels Debug] Hidden channel found:", channelId);
                        // Apply your logic to render the HiddenChannel UI for the hidden channel
                        renderHiddenChannelUI(channel);
                    }
                }
            }
        } else {
            console.log("[Hidden Channels Debug] ChannelMessages not found ❌");
        }
    }, 10000); // Delay to allow for module load
}

// Function to check if the channel is hidden (example logic, replace with actual checks)
function isHidden(channel) {
    // Check for hidden channels based on your logic (e.g., checking if the channel is in a hidden list)
    // For now, return true for testing
    return channel.channelId && channel.channelId === "698490074836238377"; // Modify this check for your needs
}

// Render the HiddenChannel UI (example)
function renderHiddenChannelUI(channel) {
    console.log("[Hidden Channels Debug] Rendering HiddenChannel UI for:", channel);
    // Insert your UI rendering logic here
    // For example: React.createElement(HiddenChannel, { channel });
}

export function onUnload() {
    console.log("[Hidden Channels Debug] Unloading Hidden Channels plugin.");
    for (const unpatch of patches) unpatch();
    patches = [];
}
