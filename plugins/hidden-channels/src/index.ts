import { findByName, findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";
import HiddenChannel from "./HiddenChannel";

let patches = [];

export function onLoad() {
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
