import express from "express";
import { readFile, readFileSync } from "fs";
import { app as electronApp } from "electron";
import * as path from "path";
import * as https from "https";
import { AddressInfo } from "net";
import send, { SendOptions } from "send";
import httpProxy from "http-proxy";

import {config} from "./config";

const atsumaruJSHTML = "<script type=\"text/javascript\" src=\"/core/player/js/rpgatsumaru.js\"></script>";

export class ResProxy {
    private _app: express.Application;
    private _localLocation: string | null = null;
    private _proxy: httpProxy;
    constructor() {
        this._app = express();
        this._app.all("*", async (req, res, next) => {
            try {
                if (this._localLocation) {
                    await this.proxyLocalRequest(req, res);
                } else {
                    await this.proxyRequest(req, res);
                }
            } catch (e) {
                next(e);
            }
        });
        // keepAliveでだいぶ早くなったが、http2ではない分まだ少しだけ遅いよ
        this._proxy = httpProxy.createProxyServer({ agent: new https.Agent({ keepAlive: true }) });
    }
    setLocalLocation(localLocation: string | null) {
        this._localLocation = localLocation;
    }
    listen(): Promise<{ port: number }> {
        return new Promise<{ port: number }>(resolve => {
            const basePath = electronApp.getAppPath();
            const options = {
                key: readFileSync(path.join(basePath, "certs", "do_not_trust.key")),
                cert: readFileSync(path.join(basePath, "certs", "do_not_trust.crt")),
            };
            const server = https.createServer(options, this._app);
            server.listen(0, "localhost", () => {
                const port = (server.address() as AddressInfo).port;
                resolve({ port });
            });
        });
    }
    private async proxyRequest(req: express.Request, res: express.Response): Promise<void> {
        if (req.method !== "GET" && req.method !== "HEAD") {
            res.status(405).send("Method Not Allowed");
            return;
        }
        this._proxy.web(req, res, {
            target: config.atsumaruResBaseUrl,
            changeOrigin: true,
        });
    }
    private async proxyLocalRequest(req: express.Request, res: express.Response): Promise<void> {
        if (req.method !== "GET" && req.method !== "HEAD") {
            res.status(405).send("Method Not Allowed");
            return;
        }
        const m = /^\/games\/gm[0-9]+\/[0-9]+\/(.+)/.exec(req.path);
        if (!m || !this._localLocation) {
            return this.proxyRequest(req, res);
        }
        const opts: SendOptions = {
            root: this._localLocation,
            maxAge: 0,
        }
        if (m[1] === "index.html") {
            let indexHtml = await new Promise<string>((resolve, reject) => {
                // index.htmlはatsumaru.jsを仕込む必要がある
                readFile(path.join(this._localLocation!, "index.html"), { encoding: "utf-8" }, (err, data) => {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve(data);
                    }
                });
            });
            let pos = indexHtml.indexOf("<head>");
            if (pos === -1) {
                pos = indexHtml.indexOf("<body>");
            }
            if (pos !== -1) {
                indexHtml = indexHtml.substr(0, pos + 6) + atsumaruJSHTML + indexHtml.substr(pos + 6);
            }
            res.status(200).send(indexHtml);
            return;
        }
        return new Promise<void>((resolve, reject) => {
            const stream = send(req, "/" + m[1], opts);
            stream.on('directory', () => {
                res.status(404).send("not found");
                resolve();
            });
            stream.on("error", err => {
                reject(err);
            });
            stream.on("end", resolve);
            stream.pipe(res);
        });
    }
}
