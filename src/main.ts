import { app, BrowserWindow, Menu, dialog, ipcMain } from "electron";
import path from "path";
import url from "url";

import { ResProxy } from "./ResProxy";
import { config } from "./config";

let currentLocalLocation: string | null = null;

const myPageUrl = url.resolve(config.atsumaruBaseUrl, '/atsumaru/my');

const resProxy = new ResProxy();

const templateMenu: Electron.MenuItemConstructorOptions[] = [
    {
        label: "設定",
        submenu: [
            {
                id: "switchLocal",
                label: "ローカルファイルに切り替え",
                type: "checkbox",
                click: (item, focusedWindow) => {
                    if (item.checked) {
                        dialog.showOpenDialog({ properties: ["openDirectory"] }, filepaths => {
                            if (filepaths && filepaths.length > 0 && filepaths[0] !== "") {
                                resProxy.setLocalLocation(filepaths[0]);
                                currentLocalLocation = filepaths[0];
                                focusedWindow.webContents.reload();
                            }
                        });
                    } else {
                        resProxy.setLocalLocation(null);
                        currentLocalLocation = null;
                        focusedWindow.webContents.reload();
                    }
                },
                checked: false,
                enabled: false,
            }
        ]
    },
    {
        label: "表示",
        submenu: [
            {
                label: "更新",
                accelerator: "F5",
                click: (_, focusedWindow) => {
                    focusedWindow.webContents.reload();
                }
            },
            {
                label: "ゲーム一覧へ移動",
                click: (_, focusedWindow) => {
                    focusedWindow.loadURL(myPageUrl);
                }
            },
            { type: 'separator' },
            {
                label: "devtoolを開く",
                accelerator: "F12",
                click: (_, focusedWindow) => {
                    focusedWindow.webContents.openDevTools();
                }
            }
        ]
    }
];

if (process.platform === 'darwin') {
    templateMenu.unshift({
        label: app.getName(),
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    });
}


app.on('window-all-closed', () => {
    app.quit();
});

app.on("certificate-error", (event, _, url, __, ___, callback) => {
    if (url.startsWith("https://localhost:")) {
        event.preventDefault();
        callback(true);
    } else {
        callback(false);
    }
});

app.on('web-contents-created', (_, contents) => {
    contents.on('new-window', event => event.preventDefault());
});

app.on('ready', async () => {
    const { port } = await resProxy.listen();
    const baseUrl = "https://localhost:" + port;

    const menu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(menu);
    const switchLocal = menu.getMenuItemById("switchLocal");

    ipcMain.on("notify-is-creator", () => switchLocal.enabled = true);

    const mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            partition: "persist:nicogame",
            preload: path.join(__dirname, "preload.js"),
        },
        title: app.getName(),
        icon: path.join(__dirname, "icon.png")
    });

    mainWindow.webContents.on("dom-ready", () => {
        mainWindow.webContents.send("set-player-app-info", {
            baseUrl,
            localLocation: currentLocalLocation
        });
    });

    mainWindow.webContents.on("will-navigate", (event, url) => {
        const newUrl = new URL(url);
        const onAccount = newUrl.hostname === config.accountHostName;
        const onAtsumaru = newUrl.hostname === config.atsumaruHostName;
        if (!onAccount && !onAtsumaru) {
            event.preventDefault();
            console.log("navigate blocked. url: " + newUrl);
        }
    });

    mainWindow.webContents.on("did-navigate-in-page", (_, url) => {
        const newUrl = new URL(url);
        const onAtsumaru = newUrl.hostname === config.atsumaruHostName;
        if (!onAtsumaru || !/^\/atsumaru\/games\/gm[0-9]+$/.test(newUrl.pathname)) {
            switchLocal.enabled = false;
        }
        switchLocal.checked = false;
        currentLocalLocation = null;
        resProxy.setLocalLocation(null);

        mainWindow.webContents.send("set-player-app-info", {
            localLocation: currentLocalLocation
        });
    });

    mainWindow.loadURL(myPageUrl);
});
