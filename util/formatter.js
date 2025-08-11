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
    switch (msgType?.toUpperCase() || 'LOG') {
        case 'CLEAR':
            return [
                ANSI.CURSOR_UP_1 + ANSI.CLEAR_LINE + ANSI.CURSOR_LEFT_MAX,
            ];
        case 'WAITBEGIN':
        case 'WAITEND':
            return [];
        case 'SETUPBEGIN':
        case 'SCRIPTBEGIN':
            return [
                CHARS.START + ANSI.BRIGHT + ANSI.FG_GREEN,
                ...strings,
                ANSI.RESET,
                CHARS.HELLIP,
            ];
        case 'SECTION':
            return [
                CHARS.SECTION + ANSI.BRIGHT + ANSI.FG_PURPLE,
                ...strings,
                ANSI.RESET,
                CHARS.HELLIP,
            ];
        case 'REMINDER':
            return [
                CHARS.REMINDER + ANSI.BRIGHT + ANSI.FG_CYAN,
                ...strings,
                ANSI.RESET,
                CHARS.HELLIP,
            ];
        case 'SETUPEND':
        case 'SCRIPTEND':
            return [
                CHARS.COMPLETE + ANSI.BRIGHT + ANSI.FG_GREEN,
                ...strings,
                ANSI.RESET,
                CHARS.HELLIP,
            ];
        case 'ERROR':
            return [
                CHARS.ERROR + ANSI.BRIGHT + ANSI.FG_RED,
                ...strings,
                ANSI.RESET,
                CHARS.HELLIP,
            ];
        case 'SUMMARY':
            return [
                CHARS.SUMMARY + ANSI.BRIGHT + ANSI.FG_YELLOW,
                ...strings,
                ANSI.RESET,
                CHARS.HELLIP,
            ];
        case 'BOLD':
            return [
                ANSI.BRIGHT,
                ...strings,
                ANSI.RESET,
            ];
        case 'ITALIC':
            return [
                ANSI.EMPHASIS,
                ...strings,
                ANSI.RESET,
            ];
        case 'URL':
            out = strings.map((s) => (
                ANSI.UNDERLINE +
                ANSI.FG_CYAN +
                s +
                ANSI.FG_DEFAULT +
                ANSI.UNDERLINE_OFF
            ));
            break;
        default:
            // do nothing
    }
    return out;
}

function getStackFileLine() {
    const out = new Error()?.stack
        ?.split('at ')?.[4]
        ?.trim()
        ?.split(' ')?.[1]
        ?.slice(1, -1)
        ?.trim();
    return out;
}

export default {
    ANSI,
    CHARS,
    forTerminal,
    duration: formatDuration,
    getStackFileLine,
};
