import crypto from 'node:crypto';
import util from 'node:util';
import child_process from 'node:child_process';
import readline from 'node:readline/promises';
import node_process from 'node:process';
import fs from 'fs/promises';
import path from 'node:path';
import url from 'url';

import dotenv from 'dotenv';

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

const ANSI = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  BRIGHT_OFF: '\x1b[21m',
  UNDERLINE: '\x1b[4m',
  UNDERLINE_OFF: '\x1b[24m',
  FG_RED: '\x1b[31m',
  FG_GREEN: '\x1b[32m',
  FG_YELLOW: '\x1b[33m',
  FG_BLUE: '\x1b[34m',
  FG_PURPLE: '\x1b[35m',
  FG_CYAN: '\x1b[36m',
  FG_DEFAULT: '\x1b[39m',
  CLEAR_LINE: '\x1b[2K',
  CURSOR_UP_1: '\x1b[1A',
  CURSOR_LEFT_MAX: '\x1b[9999D',
};

const CHARS = {
  HELLIP: '…',
  START: '🏁',
  SECTION: '🟣',
  COMPLETE: '🎉',
  ERROR: '❌',
  SUMMARY: '🔢',
  REMINDER: '🧐',
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
     * Logs a new log message
     * @param {string} category of the log
     * @param  {...any} strings 1 or more strings to output
     * @returns the console.log return value
     */
    log(category, ...strings) {
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
        return console.log(...strings);
    }

    /**
     * writes the latest log message to disk
     */
    async flush() {
        const latestStep = this.steps.at(-1);
        console.log('TODO flush', latestStep);
    }
}

export {
    Logger,
};
