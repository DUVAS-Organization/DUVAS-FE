// src/cometChatConfig.js
import { UIKitSettingsBuilder } from "@cometchat/uikit-shared";
import { CometChatUIKit } from "@cometchat/chat-uikit-react";

const COMETCHAT_CONSTANTS = {
    APP_ID: "2660975649099cba", // Replace with your App ID
    REGION: "in", // Replace with your App Region
    AUTH_KEY: "a2055b51321aa36d446a821e1361699bd28ba75b", // Replace with your Auth Key
};

// Create and configure UIKit settings
const UIKitSettings = new UIKitSettingsBuilder()
    .setAppId(COMETCHAT_CONSTANTS.APP_ID)
    .setRegion(COMETCHAT_CONSTANTS.REGION)
    .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
    .subscribePresenceForAllUsers()
    .build();

// Initialize CometChat UI Kit
export const initializeCometChat = () =>
    CometChatUIKit.init(UIKitSettings)
        .then(() => {
            console.log("Initialization completed successfully");
        })
        .catch(console.log);
