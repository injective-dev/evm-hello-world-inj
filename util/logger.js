import crypto from 'node:crypto';
import util from 'node:util';
import child_process from 'node:child_process';
import readline from 'node:readline/promises';
import node_process from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

import dotenv from 'dotenv';

import formatter from './formatter.js';

const { stdin, stdout } = node_process;
const childProcessExec = util.promisify(child_process.exec);
const hashSha256 = crypto.createHash('sha256');
const { fileURLToPath } = url;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATHS = {
    dotEnv: path.resolve(__dirname, '../.env'),
    configJson: path.resolve(__dirname, '../config.json'),
    packageJson: path.resolve(__dirname, '../package.json'),
    gitRefsHeadMain: path.resolve(__dirname, '../.git/refs/heads/main'),
};

class Logger {
    static #versionStamp = '';
    step = 0;
    steps = [];
    anonId = '';
    configJson = null;

    constructor() {
        this.init();
    }

    async init() {
        await Logger.getVersionStamp();
        const configJsonStr = await fs.readFile(
            FILE_PATHS.configJson,
        );
        this.configJson = JSON.parse(configJsonStr || '{}');
        this.anonId = this.configJson.anonId
        if (!this.anonId) {
            // generate new one if not currently set
            this.anonId = Logger.generateAnonId(7);
            this.configJson.anonId = this.anonId;
            await fs.writeFile(
                FILE_PATHS.configJson,
                JSON.stringify(this.configJson, undefined, 2),
            );
        }
    }

    static generateAnonId(length) {
        const numBytes = Math.ceil(length / 2);
        const randomBytes = crypto.randomBytes(numBytes);
        const hexString = randomBytes.toString('hex');
        return hexString.slice(0, length);
    }

    /**
     * Constructs a version stamp based on the version number and
     * git commit hash.
     * Uses cached value is set.
     * @returns {string} the version stamp constructed
     */
    static async getVersionStamp() {
        if (Logger.#versionStamp) {
            return Logger.#versionStamp; // use cached value
        }
        // obtain package.json version number and git commit hash
        const packageJsonStr = await fs.readFile(
            FILE_PATHS.packageJson,
        );
        const packageJson = JSON.parse(packageJsonStr);
        const gitRefsHeadMain = await fs.readFile(
            FILE_PATHS.gitRefsHeadMain,
        );
        const gitCommitHash = gitRefsHeadMain.toString().trim().substring(0, 7);
        Logger.#versionStamp = `${packageJson.version}-${gitCommitHash}`;
        return Logger.#versionStamp;
    }

    /**
     * If config for `ansiDisabled` is set to `true`, the output is the same as the input strings
     * Otherwise invokes `formatter.forTerminal`
     * @param {string} msgType 
     * @param  {...string} strings 
     * @returns same output type as `formatter.forTerminal`
     */
    formatForTerminal(msgType, ...strings) {
        if (this.configJson?.ansiDisabled) {
            return strings;
        }
        return formatter.forTerminal(msgType, ...strings);
    }

    /**
     * Logs a new log message
     * @param {string} category of the log
     * @param  {...any} strings 1 or more strings to output
     * @returns the console.log return value
     */
    logBase(category, ...strings) {
        const msg = [...strings][0];
        if (!msg || typeof msg !== 'string') {
            console.error('No message provided to log command');
        }
        this.step++;
        const logData = {
            t: Date.now(),
            c: category || 'log',
            v: Logger.#versionStamp,
            i: this.anonId,
            m: msg,
        };
        this.steps.push(logData);
        this.flush();
        return console.log(...(this.formatForTerminal(category, ...strings)));
    }

    /**
     * writes the latest log message to disk
     */
    async flush() {
        const latestStep = this.steps.at(-1);
        console.log('TODO flush', latestStep);
    }

    /**
     * simply prompt user to hit enter in the terminal
     */
    async logWait() {
        const rlPrompt = readline.createInterface({
            input: stdin,
            output: stdout,
        });
        await rlPrompt.question('(Hit the "return" key when ready to proceed)');
        rlPrompt.close();

        // delete the line above
        if (!this.configJson.ansiDisabled) {
            stdout.write(...formatter.forTerminal('CLEAR'));
        }
    }

    async log(...strings) {
        const ret = this.logBase(
            'log',
            ...strings,
        );
        return ret;
    }

    async logSection(...strings) {
        console.log('');
        const ret = this.logBase(
            'section',
            ...strings,
        );
        const stackFileLine = formatter.getStackFileLine();
        if (stackFileLine) {
            console.log('↪️', stackFileLine);
        }
        await this.logWait();
        return ret;
    }
}

export {
    Logger,
};
