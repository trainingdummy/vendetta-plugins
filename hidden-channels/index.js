(function(e,s){"use strict";function a(){console.log("[Hidden Channels Debug] Debug script loading..."),setTimeout(function(){const n=s.findByName("ChannelMessages",!1)||s.findByProps("ChannelMessages");if(n){console.log("[Hidden Channels Debug] ChannelMessages found \u2705");const o=n.default?._channelMessages;if(o){const l=Object.keys(o);console.log("[Hidden Channels Debug] Channel IDs found:",l);const d="698490074836238377";if(l.includes(d)){console.log("[Hidden Channels Debug] Hidden channel found!");const c=o[d];u(c)}else console.log("[Hidden Channels Debug] No hidden channels found.")}}else console.log("[Hidden Channels Debug] ChannelMessages not found \u274C")},1e4)}function i(){console.log("[Hidden Channels Debug] Debug script unloaded.")}function u(n){console.log("[Hidden Channels Debug] Rendering HiddenChannel UI for:",n)}return e.onLoad=a,e.onUnload=i,e})({},vendetta.metro);
