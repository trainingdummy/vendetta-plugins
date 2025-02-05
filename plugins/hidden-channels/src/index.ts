import { findByName, findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";
import HiddenChannel from "./HiddenChannel";

let patches = [];

export function onLoad() {

    const possibleModules = [
    "MessagesWrapperConnected",
    "ChannelMessages",
    "MessageActionCreators",
    "MessagePreviewStore",
    "GuildBasicChannels",
    "ChannelStore"
    ];

    for (const mod of possibleModules) {
        const found = vendetta.modules.findByName(mod, false) || vendetta.modules.findByProps(mod);
        console.log(`[Hidden Channels Debug] ${mod}:`, found);
    }
    
    const ChannelMessages = vendetta.modules.findByName("ChannelMessages", false) || vendetta.modules.findByProps("ChannelMessages");
    
    console.log("[Hidden Channels Debug] ChannelMessages:", ChannelMessages);
    console.log("[Hidden Channels Debug] ChannelMessages prototype:", ChannelMessages?.prototype);
    
    const MessagesWrapperConnected = findByName("MessagesWrapperConnected", false);
    if (!MessagesWrapperConnected) {
        console.error("Hidden Channels plugin: 'MessagesWrapperConnected' component not found.");
        return;
    }

    patches.push(
        instead("default", MessagesWrapperConnected, (args, orig) => {
            const channel = args[0]?.channel;
            if (!channel || typeof orig !== "function") return orig(...args);

            if (!isHidden(channel)) {
                return orig(...args);
            } else {
                console.log("Hidden Channels plugin: Rendering HiddenChannel UI for hidden channel:", channel.id);
                return React.createElement(HiddenChannel, { channel });
            }
        })
    );
}

export function onUnload() {
    for (const unpatch of patches) unpatch();
    patches = [];
}
