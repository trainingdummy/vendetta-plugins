(function(o,h,n,a,f,y){"use strict";const{View:C,Text:l,Pressable:R}=a.findByProps("Button","Text","View"),u=a.findByProps("extractTimestamp"),i=n.stylesheet.createThemedStyleSheet({container:{flex:1,padding:16,alignItems:"center",justifyContent:"center"},title:{fontFamily:n.constants.Fonts.PRIMARY_SEMIBOLD,fontSize:24,textAlign:"left",color:f.semanticColors.HEADER_PRIMARY,paddingVertical:25},text:{flex:1,flexDirection:"row",fontSize:16,textAlign:"justify",color:f.semanticColors.HEADER_PRIMARY},dateContainer:{height:16,alignSelf:"baseline"}});function c(e){let{date:t}=e;return React.createElement(R,{style:i.dateContainer,onPress:function(){n.toasts.open({content:n.moment(t).toLocaleString(),source:y.getAssetByName("clock").id})},onLongPress:function(){n.clipboard.setString(t.getTime().toString()),n.toasts.open({content:"Copied to clipboard"})}},React.createElement(l,{style:i.text},n.moment(t).fromNow()))}function P(e){let{channel:t}=e;return React.createElement(C,{style:i.container},React.createElement(l,{style:i.title},"This channel is hidden."),React.createElement(l,{style:i.text},"Topic: ",t.topic||"No topic.",`

`,"Creation date: ",React.createElement(c,{date:new Date(u.extractTimestamp(t.id))}),`

`,"Last message: ",t.lastMessageId?React.createElement(c,{date:new Date(u.extractTimestamp(t.lastMessageId))}):"No messages.",`

`,"Last pin: ",t.lastPinTimestamp?React.createElement(c,{date:new Date(t.lastPinTimestamp)}):"No pins."))}let p=[];const m=a.findByProps("getChannelPermissions","can");a.findByProps("transitionToGuild"),a.findByProps("stores","fetchMessages");const{ChannelTypes:r}=a.findByProps("ChannelTypes"),{getChannel:E}=a.findByProps("getChannel"),T=[r.DM,r.GROUP_DM,r.GUILD_CATEGORY];function x(e){if(!e||(typeof e=="string"&&(e=E(e)),!e||T.includes(e.type)))return!1;e.realCheck=!0;const t=!m.can(n.constants.Permissions.VIEW_CHANNEL,e);return delete e.realCheck,console.log(`isHidden: channel ${e?.id} hidden? ${t}`),t}function M(){const e=["MessagesWrapperConnected","ChannelReader","MessagesList","ChannelMessages"];let t=null;for(const s of e)if(t=a.lazyDestructure(function(){return a.findByProps(s)}),t){console.log(`Hidden Channels plugin: Found candidate component: ${s}`);break}else console.log(`Hidden Channels plugin: Candidate ${s} not found.`);t?p.push(h.instead("default",t,function(s,g){const d=s[0]?.channel;return!x(d)&&typeof g=="function"?g(...s):(console.log("Hidden Channels plugin: Rendering HiddenChannel UI for channel:",d?.id),n.React.createElement(P,{channel:d}))})):console.error("Hidden Channels plugin: No suitable messages component found. Plugin enabled but will not patch UI.")}function B(){for(const e of p)e()}var D={onLoad:M,onUnload:B};return o.default=D,Object.defineProperty(o,"__esModule",{value:!0}),o})({},vendetta.patcher,vendetta.metro.common,vendetta.metro,vendetta.ui,vendetta.ui.assets);
