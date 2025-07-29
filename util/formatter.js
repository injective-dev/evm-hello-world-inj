
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

/**
 * @param {string} msgType 
 * @param  {...string} strings 
 * @returns an array of strings that contains added ANSI characters suitable for
 *   output in terminals
 */
function forTerminal(msgType, ...strings) {
    let out = strings;
    switch (msgType?.toUpperCase() || 'LOG') {
        case 'START':
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
        case 'COMPLETE':
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

export default {
    forTerminal,
};
