import { ipcRenderer } from "electron";

declare global {
    interface Window {
        PlayerApp?: PlayerApp;
    }
}

interface PlayerApp {
    baseUrl: string | null;
    localLocation: string | null;
    notifyIsCreator: () => void;
}

const PlayerApp = {
    baseUrl: null,
    localLocation: null,
    notifyIsCreator: () => ipcRenderer.send("notify-is-creator")
};
window.PlayerApp = PlayerApp;

ipcRenderer.on("set-player-app-info", (_: unknown, newInfo: Partial<PlayerApp>) => {
    if (window.PlayerApp) {
        window.PlayerApp = {
            ...window.PlayerApp,
            ...newInfo
        }
    } else {
        window.PlayerApp = {
            ...PlayerApp,
            ...newInfo
        }
    }
});
