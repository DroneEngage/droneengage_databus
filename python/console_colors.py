"""
Python implementation of colors and console output formatting
Equivalent to C++ helpers/colors.hpp
"""

class Colors:
    """Console color codes for Python"""
    
    # Reset
    NORMAL_CONSOLE_TEXT = "\033[0m"
    
    # Regular colors
    INFO_CONSOLE_TEXT = "\033[96m"      # Cyan
    SUCCESS_CONSOLE_TEXT = "\033[92m"   # Green
    ERROR_CONSOLE_TEXT = "\033[91m"     # Red
    LOG_CONSOLE_TEXT = "\033[93m"       # Yellow
    
    # Bold colors
    INFO_CONSOLE_BOLD_TEXT = "\033[1;96m"      # Bold Cyan
    SUCCESS_CONSOLE_BOLD_TEXT = "\033[1;92m"   # Bold Green
    ERROR_CONSOLE_BOLD_TEXT = "\033[1;91m"     # Bold Red
    LOG_CONSOLE_BOLD_TEXT = "\033[1;93m"       # Bold Yellow


# Export for compatibility
_INFO_CONSOLE_TEXT = Colors.INFO_CONSOLE_TEXT
_NORMAL_CONSOLE_TEXT_ = Colors.NORMAL_CONSOLE_TEXT
_ERROR_CONSOLE_BOLD_TEXT_ = Colors.ERROR_CONSOLE_BOLD_TEXT
_SUCCESS_CONSOLE_TEXT_ = Colors.SUCCESS_CONSOLE_TEXT
_LOG_CONSOLE_BOLD_TEXT = Colors.LOG_CONSOLE_BOLD_TEXT
_INFO_CONSOLE_BOLD_TEXT = Colors.INFO_CONSOLE_BOLD_TEXT
