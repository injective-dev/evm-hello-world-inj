import crypto from 'node:crypto';
import node_util from 'node:util';
import node_child_process from 'node:child_process';
import readline from 'node:readline/promises';
import node_process from 'node:process';
import fs from 'node:fs/promises';
import fs_callbacks from 'node:fs';

import formatter from './formatter.js';
import FILE_PATHS from './file-paths.js';
import { Debounce } from './perf.js';

const childProcessExec = node_util.promisify(node_child_process.exec);
const { stdin, stdout, stderr } = node_process;
const fmt = formatter.basicTerminal;

class Logger {
    static #versionStamp = '';
    anonId = '';
    configJson = null;
    #initHasBeenCalled = false;
    #flushRemoteDebounce = null;
    steps = [];
    #step = -1;
    #flushedStepDisk = -1;
    #flushedStepRemote = -1;

    f = {
        bold: (s) => ( this.#noAnsi() ? s : fmt.bold(s) ),
        italic: (s) => ( this.#noAnsi() ? s : fmt.italic(s) ),
        url: (s) => ( this.#noAnsi() ? s : fmt.url(s) ),
        highlighter: (s) => ( this.#noAnsi() ? s : fmt.highlighterYellow(s) ),
    };

    #categoryShortForms = {
        'LOG': 'L',
        'CLEAR': 'C',
        'WAITBEGIN': 'WB',
        'WAITEND': 'WE',
        'SETUPBEGIN': 'UB',
        'SCRIPTBEGIN': 'SB',
        'SECTION': 'S',
        'SECTIONWW': 'SW',
        'REMINDER': 'R',
        'SETUPEND': 'UE',
        'SCRIPTEND': 'SE',
        'ERROR': 'E',
        'INFOBOX': 'I',
        'INFOBOXWW': 'IW',
        'SUMMARY': 'SY',
    }

    /**
     * You **must** await `init` **before** using logger.
     *
     * Example:
     * ```js
     * const logger = new Logger();
     * await logger.init();
     * /// ... do things with logger
     * ```
     */
    constructor() {
    }

    /**
     * Logger obtains its version stamp and anonymous ID
     * @returns nil
     */
    async init() {
        if (this.#initHasBeenCalled) {
            return;
        }
        this.#initHasBeenCalled = true;
        await Logger.getVersionStamp();
        const configJsonStr = await fs.readFile(
            FILE_PATHS.configJson,
        );
        this.configJson = JSON.parse(configJsonStr || '{}');
        this.anonId = this.configJson.anonId;
        this.#flushRemoteDebounce = new Debounce(2e3);
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
        const gitRefsHead = await fs.readFile(
            FILE_PATHS.gitHead,
        );
        const gitBranchName = gitRefsHead.toString().trim().replace('ref: refs/heads/', '');
        let gitRefsCurrentBranchFileName = '';
        const isMainBranch = (gitBranchName === 'main');
        if (isMainBranch) {
            gitRefsCurrentBranchFileName = FILE_PATHS.gitRefsHeadMain;
        } else {
            gitRefsCurrentBranchFileName = FILE_PATHS.getGitRefPathForBranch(gitBranchName);
        }
        const gitCommitHash = await fs.readFile(
            gitRefsCurrentBranchFileName,
        );
        const gitCommitHashStr = gitCommitHash.toString().trim().substring(0, 7);
        const gitHashAndBranch = isMainBranch ?
            gitCommitHashStr :
            `${gitCommitHashStr}-${gitBranchName.replace(/[^a-zA-Z0-9]/g, '_')}`;
        Logger.#versionStamp = `${packageJson.version}-${gitHashAndBranch}`;
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
     * @returns {boolean} true when ANSI is explicitly disabled in the config (false by default)
     */
    #noAnsi () {
        return this.configJson?.ansiDisabled;
    }

    /**
     * Logs a new log message
     * @param {string} category of the log
     * @param  {...any} strings 1 or more strings to output
     * @returns the console.log return value
     */
    #logBase(category, ...strings) {
        const [msg] = [...strings];
        const isNotWait = (category !== 'waitBegin' &&
            category !== 'waitEnd');
        if (isNotWait) {
            if (!msg || typeof msg !== 'string') {
                console.error('No message provided to log command');
            }
        }
        const categoryShortForm = this.#categoryShortForms[(category || 'log').toUpperCase()];
        const logData = {
            t: Date.now(),
            c: categoryShortForm,
            v: Logger.#versionStamp,
            i: this.anonId,
            m: msg,
        };
        this.#step++;
        this.steps.push(logData);
        const shouldForceFlush = isNotWait &&
            (category === 'section' ||
            category === 'scriptEnd' ||
            category === 'error' ||
            category === 'setupBegin' ||
            category === 'setupEnd');
        console.log('logBase category, shouldForceFlush:', category, shouldForceFlush);
        this.flush(shouldForceFlush); // intentionally not await-ed even though it is async
        if (!msg) {
            return;
        }
        return console.log(
            ...(this.formatForTerminal(category, ...strings)),
        );
    }

    /**
     * writes the latest log message to disk and remote
     * debouncing is present for writing to remote, such as to allow multiple log messages to accrue
     * before each write to remote as a perf/ bandwidth optimisation
     * @param {boolean} force when true, debounce is logic is skipped (default is false)
     */
    async flush(force = false) {
        const shouldInvokeFlushRemote =
            (!this.configJson.disableAnonymisedMetricsLogging) &&
            (force || this.#flushRemoteDebounce.attempt());
        console.log('flush shouldInvokeFlushRemote:', shouldInvokeFlushRemote);
        if (shouldInvokeFlushRemote) {
            this.flushRemote(); // intentionally do not `await` any flushRemote invocations
        } // else do nothing, will need to be called again - that is the point of debouncing

        await this.flushDisk();
    }

    /**
     * writes all log message(s), that have accrued since its last invocation, to disk
     */
    async flushDisk() {
        let out = '';
        while (this.#flushedStepDisk < this.#step) {
            this.#flushedStepDisk++;
            const latestStep = this.steps[this.#flushedStepDisk];
            const latestStepStr = JSON.stringify(latestStep, undefined, 0);
            out += `${latestStepStr}\n`
        }
        await fs.appendFile(FILE_PATHS.logs, out);
    }

    /**
     * writes all log message(s), that have accrued since its last invocation, to remote
     */
    async flushRemote() {
        const stepsToFlush = [];
        while (this.#flushedStepRemote < this.#step) {
            this.#flushedStepRemote++;
            const latestStep = this.steps[this.#flushedStepRemote];
            const hashInput = `c:${latestStep.c}|t:${latestStep.t}|v:${latestStep.v}|m:${latestStep.m || ''}|i:${latestStep.i}`;
            const hashSha256 = crypto.createHash('sha256');
            hashSha256.update(hashInput);
            const hash = hashSha256.digest('hex').slice(0, 8);
            stepsToFlush.push({ ...latestStep, hash });
        }
        console.log('flushRemote:', stepsToFlush.length);
        if (stepsToFlush.length < 1) {
            return; // there's no reason to send a request
        }
        const metricsBody = {
            events: stepsToFlush,
        };
        const metricsBodyStr = JSON.stringify(metricsBody);
        const fetchPromise = fetch(
            this.configJson.metricsUrl, {
                method: 'POST',
                body: metricsBodyStr,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
        fetchPromise.catch(console.error);
    }

    #getStackFileLine() {
        let stackFileLine = formatter.getStackFileLine();
        if (stackFileLine) {
            stackFileLine = stackFileLine.replace('file://', '');
        }
        return stackFileLine;
    }

    /**
     * simply prompt user to hit enter in the terminal
     */
    async logWait() {
        this.#logBase('waitBegin');
        await this.askQuestion('(Hit the "return" key when ready to proceed)');

        // delete the line above
        if (!this.configJson.ansiDisabled) {
            stdout.write(...formatter.forTerminal('CLEAR'));
        }
        this.#logBase('waitEnd');
    }

    async log(...strings) {
        const ret = this.#logBase(
            'log',
            ...strings,
        );
        return ret;
    }

    async logSetupBegin(...strings) {
        const ret = this.#logBase(
            'setupBegin',
            ...strings,
        );
        return ret;
    }

    async logSetupEnd(...strings) {
        const ret = this.#logBase(
            'setupEnd',
            ...strings,
        );
        return ret;
    }

    async logScriptBegin(...strings) {
        const ret = this.#logBase(
            'scriptBegin',
            ...strings,
        );
        if (!this.configJson.disableAutoFileLineOpen) {
            const fileLine = this.#getStackFileLine();
            if (fileLine) {
                this.loggerJumpToFileLine(fileLine);
            }
        }
        return ret;
    }

    async logScriptEnd(...strings) {
        const ret = this.#logBase(
            'scriptEnd',
            ...strings,
        );
        return ret;
    }

    async loggerJumpToFileLine(fileLine) {
        if (!fileLine ||
            typeof fileLine !== 'string') {
            throw new Error('File line not valid');
        }
        await childProcessExec(`code --goto "${fileLine}"`, { stdout, stderr });
    }

    async logSection(...strings) {
        return this.#logSectionImpl(true, ...strings);
    }

    async logSectionAndWait(...strings) {
        return this.#logSectionImpl(true, ...strings);
    }

    async logSectionWithoutWait(...strings) {
        return this.#logSectionImpl(false, ...strings);
    }

    async #logSectionImpl(shouldWait, ...strings) {
        console.log('');
        const ret = this.#logBase(
            (shouldWait ? 'section' : 'sectionWW'),
            ...strings,
        );
        const fileLine = this.#getStackFileLine();
        console.log('↪️', fileLine);
        shouldWait && await this.logWait();
        return ret;
    }

    async logProcess(command) {
        await this.log('$ ', this.f.bold(command), "\n...");
        const result = await childProcessExec(command, { stdout, stderr });
        const { stdout: output } = result;
        console.log(output);
        return result;
    }

    logError(...strings) {
        const ret = this.#logBase(
            'error',
            ...strings,
        );
        this.#getStackFileLine();
        return ret;
    }

    async logInfoBox(title, ...strings) {
        return this.#logInfoBoxImpl(true, title, ...strings);
    }

    async logInfoBoxWithoutWait(title, ...strings) {
        return this.#logInfoBoxImpl(false, title, ...strings);
    }

    async #logInfoBoxImpl(shouldWait, title, ...strings) {
        shouldWait && await this.logWait();
        const ret = this.#logBase(
            (shouldWait ? 'infoBox' : 'infoBoxWW'),
            title,
            ...strings,
        );
        return ret;
    }

    async askQuestion(prompt = '> ') {
        const rlPrompt = readline.createInterface({
            input: stdin,
            output: stdout,
        });
        const inputValue = await rlPrompt.question(prompt);
        rlPrompt.close();
        return inputValue;
    }

    async logsLoad() {
        return new Promise((resolve) => {
            let logs = [];
            const fileStream = fs_callbacks.createReadStream(FILE_PATHS.logs);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });
            rl.on('line', (lineStr) => {
                const log = JSON.parse(lineStr);
                if (log.c === 'setupBegin') {
                    logs = []; // discard prior runs, we only want the latest
                }
                logs.push(log);
            });
            rl.on('close', () => {
                resolve(logs);
            });
        });
    }

    async logsSummary(logs) {
        const scripts = {};
        const summary = {
            setupDuration: 0,
            scriptCount: 0,
            totalDuration: 0,
            beginCount: 0,
            endCount: 0,
            errorCount: 0,
            completionRate: 1,
        };
        const scriptsSequence = [];

        // initial data
        logs.forEach((log) => {
            const script = scripts[log.m] || {
                beginCount: 0,
                endCount: 0,
                errorCount: 0,
                totalDurationForComplete: 0,
                totalDurationForError: 0,
            };
            let shouldAdd = false;
            switch (log.c) {
                case 'setupBegin':
                case 'scriptBegin':
                    script.beginCount++;
                    script.beginCurrent = log.t;
                    script.beginTsFirst = Math.min(log.t, (script.beginTsFirst || Number.MAX_SAFE_INTEGER));
                    script.beginTsLast = Math.max(log.t, (script.beginTsLast || Number.MIN_SAFE_INTEGER));
                    summary.beginTsFirst = Math.min(log.t, (summary.beginTsFirst || Number.MAX_SAFE_INTEGER));
                    shouldAdd = true;
                    break;
                case 'setupEnd':
                case 'scriptEnd':
                    script.endCount++;
                    script.totalDurationForComplete = script.totalDurationForComplete + (log.t - script.beginCurrent);
                    script.endTsFirst = Math.min(log.t, (script.endTsFirst || Number.MAX_SAFE_INTEGER));
                    script.endTsLast = Math.max(log.t, (script.endTsLast || Number.MIN_SAFE_INTEGER));
                    summary.endTsLast = Math.max(log.t, (summary.endTsLast || Number.MIN_SAFE_INTEGER));
                    shouldAdd = true;
                    break;
                case 'error':
                    script.errorCount++;
                    script.totalDurationForError = script.totalDurationForError + (log.t - script.beginCurrent);
                    script.errorTsFirst = Math.min(log.t, (script.errorTsFirst || Number.MAX_SAFE_INTEGER));
                    script.errorTsLast = Math.max(log.t, (script.errorTsLast || Number.MIN_SAFE_INTEGER));
                    shouldAdd = true;
                    break;
            }
            if (shouldAdd) {
                if (
                    log.m !== 'setup' &&
                    log.m !== 'stats' &&
                    !scripts[log.m]
                ) {
                    scriptsSequence.push(log.m);
                }
                scripts[log.m] = script;
            }
        });

        // aggregate data
        const aggregatedScripts = {};
        const scriptsEntries = Object.entries(scripts);
        scriptsEntries.forEach(([name, script]) => {
            if (
                name === 'setup' ||
                name === 'stats'
            ) {
                return;
            }
            summary.scriptCount++;
            const {
                beginCount,
                endCount,
                errorCount,
                totalDurationForComplete,
                totalDurationForError,
            } = script;
            const averageDurationForComplete = (endCount === 0) ?
                0 :
                totalDurationForComplete / endCount;
            const averageDurationForError = (errorCount === 0) ?
                0 :
                totalDurationForError / errorCount;
            const totalDuration = totalDurationForComplete + totalDurationForError;
            const aggScript = {
                beginCount,
                endCount,
                errorCount,
                averageDurationForComplete,
                averageDurationForError,
                totalDuration,
            };
            summary.totalDuration += totalDuration;
            summary.beginCount += beginCount;
            summary.endCount += endCount;
            summary.errorCount += errorCount;
            aggregatedScripts[name] = aggScript;
        });
        if (scripts.setup) {
            summary.setupDuration =
                scripts.setup.totalDurationForComplete +
                scripts.setup.totalDurationForError;
        }

        // summary of data in human readable form
        summary.completionRate = Math.round(summary.endCount / summary.beginCount * 1000) / 1000;
        aggregatedScripts.summary = summary;
        const stepsDisplayText = scriptsSequence.map((step) => {
            const {
                beginCount,
                endCount,
            } = scripts[step];
            return `${step} (${endCount}/${beginCount})`;
        }).join(', ');
        aggregatedScripts.summaryText =
`Summary stats:
- Setup duration    : ${formatter.duration(summary.setupDuration)}
- Duration for steps: ${formatter.duration(summary.totalDuration)}
- Steps attempted   : ${stepsDisplayText}
- Total attempts    : ${summary.scriptCount}
- Completion rate   : ${(summary.completionRate * 100).toFixed(1)}%
`;

        return aggregatedScripts;
    }

    async delay(ms) {
        if (typeof ms !== 'number' || isNaN(ms) || ms <= 0) {
            ms = 1;
        }
        await new Promise(resolve => setTimeout(resolve, ms));
    }
}

export {
    Logger,
};
