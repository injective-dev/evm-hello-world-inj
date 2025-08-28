import node_url from 'node:url';
import FILE_PATHS from './file-paths.js';

const { fileURLToPath } = node_url;
const __filename = fileURLToPath(import.meta.url);

const ANSI = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  EMPHASIS: '\x1b[3m',
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
  HIGHLIGHTER_YELLOW: '\x1b[38;5;202;48;5;227m',
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
  POINT_LEFT: '👈',
  POINT_RIGHT: '👉',
};

/**
 * For an input number of milliseconds, returns a string that is either:
 * (1) seconds with 1 decimal place, e.g.:
 *  1100 --> "1.1s"
 * (2) OR minutes with 0 decimal places and seconds with 1 decimal place, e.g.:
 * 61100 --> "1m 1.1s"
 * @param {Number} ms a duration in milliseconds
 * @returns {String} a human readable duration
 */
function formatDuration(ms) {
    const s = ms / 1000;
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    if (minutes === 0) {
        return `${(seconds).toFixed(1)}s`;
    } else {
        return `${minutes}m ${(seconds).toFixed(1)}s`;
    }
}

/**
 * @param {string} msgType 
 * @param  {...string} strings 
 * @returns an array of strings that contains added ANSI characters suitable for
 *   output in terminals
 */
function forTerminal(msgType, ...strings) {
    let out = strings;
    const [firstStr, ...restOfStrs] = [...strings];
    switch (msgType?.toUpperCase() || 'LOG') {
        case 'CLEAR':
            out = [
                ANSI.CURSOR_UP_1 +
                ANSI.CLEAR_LINE +
                ANSI.CURSOR_LEFT_MAX
            ];
            break;
        case 'WAITBEGIN':
        case 'WAITEND':
            out = [];
            break;
        case 'SETUPBEGIN':
        case 'SCRIPTBEGIN':
            out = [
                CHARS.START + ANSI.BRIGHT + ANSI.FG_GREEN,
                firstStr,
                ANSI.RESET + CHARS.HELLIP,
                ...restOfStrs,
            ];
            break;
        case 'SECTION':
        case 'SECTIONWW':
            out = [
                CHARS.SECTION + ANSI.BRIGHT + ANSI.FG_PURPLE,
                firstStr,
                ANSI.RESET + CHARS.HELLIP,
                ...restOfStrs,
            ];
            break;
        case 'REMINDER':
            out = [
                CHARS.REMINDER + ANSI.BRIGHT + ANSI.FG_CYAN,
                firstStr,
                ANSI.RESET + CHARS.HELLIP,
                ...restOfStrs,
            ];
            break;
        case 'SETUPEND':
        case 'SCRIPTEND':
            out = [
                CHARS.COMPLETE + ANSI.BRIGHT + ANSI.FG_GREEN,
                firstStr,
                ANSI.RESET + CHARS.HELLIP,
                ...restOfStrs,
            ];
            break;
        case 'ERROR':
            out = [
                CHARS.ERROR + ANSI.BRIGHT + ANSI.FG_RED,
                firstStr,
                ANSI.RESET + CHARS.HELLIP,
                ...restOfStrs,
            ];
            break;
        case 'INFOBOX':
            const infoBoxWidth = firstStr.length + 4;
            const infoBoxHorizLine = ('=').repeat(infoBoxWidth);
            out = [
                '\n' + ANSI.FG_CYAN + infoBoxHorizLine + '\n| ' +
                ANSI.RESET + ANSI.BRIGHT + ANSI.FG_YELLOW + firstStr + ANSI.RESET + ANSI.FG_CYAN  + ' |\n' +
                infoBoxHorizLine + ANSI.RESET + '\n',
                ...restOfStrs,
                ANSI.RESET + ANSI.FG_CYAN + '\n' + infoBoxHorizLine + '\n' + ANSI.RESET,
            ];
            break;
        case 'SUMMARY':
            out = [
                CHARS.SUMMARY + ANSI.BRIGHT + ANSI.FG_YELLOW,
                ...firstStr,
                ANSI.RESET,
                CHARS.HELLIP,
                ...restOfStrs,
            ];
            break;
        case 'BOLD':
            out = strings.map(basicTerminal.bold);
            break;
        case 'ITALIC':
            out = strings.map(basicTerminal.italic);
            break;
        case 'URL':
            out = strings.map(basicTerminal.url);
            break;
        case 'HIGHLIGHTER':
        case 'HIGHLIGHTER_YELLOW':
            out = strings.map(basicTerminal.highlighterYellow);
            break;
        default:
            // do nothing
    }
    return out;
}

const basicTerminal = {
    bold: (s) => (
        ANSI.BRIGHT +
        s +
        ANSI.RESET
    ),
    url: (s) => (
        ANSI.UNDERLINE +
        ANSI.FG_CYAN +
        s +
        ANSI.FG_DEFAULT +
        ANSI.UNDERLINE_OFF
    ),
    italic: (s) => (
        ANSI.EMPHASIS +
        s +
        ANSI.RESET
    ),
    highlighterYellow: (s) => (
        ANSI.HIGHLIGHTER_YELLOW +
        s +
        ANSI.RESET
    ),
};

const skippedStackFiles = [
    __filename,
    __filename.replace('formatter.js', 'logger.js'),
];

function getStackFileLine() {
    const err = new Error();
    const out = err
        ?.stack
        ?.split('at ')
        .slice(1)
        .map((s) => {
            const lineParts1 = s.split('file://')[1];
            if (lineParts1) {
                return lineParts1
                    ?.trim()
                    .split(')')[0];
            } else {
                // this is likely to happen for lines with 'node:' instead of a file on disk
                return skippedStackFiles[0]; // intention: so it gets skipped
            }
        })
        .filter((s) => (
            !(s?.startsWith(skippedStackFiles[0])) &&
            !(s?.startsWith(skippedStackFiles[1])) &&
            s?.startsWith(FILE_PATHS.rootDir)
        ));
    return out[0];
}

export default {
    ANSI,
    CHARS,
    forTerminal,
    basicTerminal,
    duration: formatDuration,
    getStackFileLine,
};
