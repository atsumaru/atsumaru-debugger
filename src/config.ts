import * as fs from "fs";
import * as path from "path";

interface Config {
    atsumaruBaseUrl: string;
    atsumaruResBaseUrl: string;
    atsumaruHostName: string;
    accountHostName: string;
};

export const config: Config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", process.argv[2] || "config.json"), "utf-8"));
