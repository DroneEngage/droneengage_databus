// Define ANSI escape codes for colors
const ERROR_CONSOLE_BOLD_TEXT = '\x1b[1;31m'; // Bold Red
const ERROR_CONSOLE_TEXT = '\x1b[31m'; // Red
const SUCCESS_CONSOLE_BOLD_TEXT = '\x1b[1;32m'; // Bold Green
const SUCCESS_CONSOLE_TEXT = '\x1b[32m'; // Green
const INFO_CONSOLE_BOLD_TEXT = '\x1b[1;33m'; // Bold Yellow
const INFO_CONSOLE_TEXT = '\x1b[33m'; // Yellow
const LOG_CONSOLE_TEXT = '\x1b[34m'; // Blue
const LOG_CONSOLE_BOLD_TEXT = '\x1b[1;34m'; // Bold Blue
const TEXT_BOLD_HIGHTLITED = '\x1b[1;37m'; // Bold White
const BOLD_CONSOLE_TEXT = '\x1b[1m'; // Bold
const BK_BLUE_WHITE_TEXT = '\x1b[1;37;44m'; // Bold White on Blue
const BK_WHITE_BLUE_TEXT = '\x1b[1;34;47m'; // Bold Blue on White
const BK_RED_WHITE_TEXT = '\x1b[1;37;41m'; // Bold White on Red
const NORMAL_CONSOLE_TEXT = '\x1b[0m'; // Reset

module.exports = {
    ERROR_CONSOLE_BOLD_TEXT,
    ERROR_CONSOLE_TEXT,
    SUCCESS_CONSOLE_BOLD_TEXT,
    SUCCESS_CONSOLE_TEXT,
    INFO_CONSOLE_BOLD_TEXT,
    INFO_CONSOLE_TEXT,
    LOG_CONSOLE_TEXT,
    LOG_CONSOLE_BOLD_TEXT,
    TEXT_BOLD_HIGHTLITED,
    BOLD_CONSOLE_TEXT,
    BK_BLUE_WHITE_TEXT,
    BK_WHITE_BLUE_TEXT,
    BK_RED_WHITE_TEXT,
    NORMAL_CONSOLE_TEXT
};