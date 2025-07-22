# ROVO DEV - CENTRAL DEVELOPMENT RULES

## CRITICAL SECURITY RULES (PRIORITY 1)

### ABSOLUTE UNICODE PROHIBITION
**NEVER use:**
- Unicode icons/emojis in code, console, chat or documentation
- `find_and_replace_code` with Unicode characters
- German umlauts (Unicode U+00E4, U+00F6, U+00FC, U+00DF) in ALL situations - including chat and comments
- The "Eszett" character (Unicode U+00DF) - ALWAYS replace with "ss"
- German special characters in any form

### CHAT-SPECIFIC UNICODE PROHIBITIONS
**ABSOLUTELY FORBIDDEN IN CHAT:**
- Emojis and icons (U+1F600-U+1F64F, U+1F300-U+1F5FF, U+1F680-U+1F6FF, etc.)
- Arrows and symbols (U+2190-U+21FF, U+2600-U+26FF, U+2700-U+27BF)
- Mathematical symbols (U+2200-U+22FF)
- Geometric shapes (U+25A0-U+25FF)
- Special characters like checkmarks, warning symbols, etc.

**ALLOWED CHAT ALTERNATIVES:**
- Instead of emojis: Text descriptions (SUCCESS, WARNING, ERROR)
- Instead of arrows: ASCII characters (-> <- => <=)
- Instead of checkmarks: [OK], [SUCCESS], [DONE]
- Instead of warning symbols: [WARNING], [ATTENTION], [PROBLEM]
- Instead of green checkmarks: [OK], [COMPLETED], [FIXED]
- Instead of red X: [ERROR], [PROBLEM], [FAILED]

**REASON:** Causes 'charmap' codec errors that completely empty files!

**ABSOLUTE UNICODE PROHIBITION (EXTENDED):**
- ae instead of Unicode U+00E4 - ALWAYS
- oe instead of Unicode U+00F6 - ALWAYS  
- ue instead of Unicode U+00FC - ALWAYS
- ss instead of Unicode U+00DF - ALWAYS

### BACKUP REQUIREMENT
- BEFORE every change: Automatic backup
- Format: `filename_backup_YYYYMMDD_HHMMSS.ext`
- Never work without backup

### INCREMENTAL DEVELOPMENT
- Small, testable changes
- After every change: Function test
- On errors: Immediate rollback

## DEVELOPMENT GUIDELINES (PRIORITY 2)

### CODE QUALITY
- Clean, readable structure
- Meaningful variable names
- Comments in English (ASCII-only)
- Consistent indentation

### PERFORMANCE
- Prefer efficient algorithms
- Avoid memory leaks
- Optimize rendering performance
- Use batch operations

### ERROR HANDLING
- Try-catch for critical operations
- Meaningful error messages
- Graceful degradation
- Enable logging

## SECURITY MEASURES (PRIORITY 3)

### AUTOMATIC CHECKS
- Unicode scanner before every change
- Syntax validation
- Performance tests
- Backup verification

### MONITORING
- Continuous monitoring
- Automatic alerts
- Performance metrics
- Error tracking

### RECOVERY STRATEGIES
- Quick rollback capabilities
- Backup restoration
- Emergency procedures
- Documented recovery steps

## WORKFLOW RULES (PRIORITY 4)

### DEVELOPMENT CYCLE
1. Create backup
2. Perform Unicode check
3. Implement small change
4. Perform function test
5. On success: Commit, on error: Rollback

### TESTING
- Unit tests for new features
- Integration tests for changes
- Performance tests for optimizations
- User acceptance tests before release

### DOCUMENTATION
- Keep code comments current
- Maintain README files
- Keep changelog
- Create API documentation

## TECHNICAL STANDARDS (PRIORITY 5)

### FILE FORMATS
- Avoid UTF-8 encoding for critical files
- ASCII-only for configuration files
- JSON for data structures
- Markdown for documentation (ASCII-only)

### NAMING CONVENTIONS
- camelCase for JavaScript variables
- PascalCase for classes
- UPPER_CASE for constants
- kebab-case for CSS classes

### VERSIONING
- Semantic versioning (Major.Minor.Patch)
- Git tags for releases
- Follow branching strategy
- Meaningful commit messages

**MENTAL ENFORCEMENT RULES:**
- On EVERY Unicode thought: STOP and use ASCII
- On EVERY change: Backup check
- On EVERY error: Check rollback option
- On EVERY implementation: Step-by-step

## COMMUNICATION RULES (PRIORITY 1)

### PRECISE ANSWERS
- Answer closed questions exactly (yes/no)
- Do not interpret what might be meant
- Ask for clarification instead of guessing when unclear
- Do not assume suggestive questions
- Give precise and direct answers

### CODE CONSISTENCY RULE
- On changes (e.g. renaming variables): Check ALL affected files
- Ensure consistency across entire codebase
- Perform related changes in one go
- WARNING: This rule can cause problems - further adjustment possible

**THESE RULES ARE ABSOLUTE AND APPLY TO ALL FUTURE WORK**

## CHAT LANGUAGE RULE (PRIORITY 1)

### MANDATORY CHAT LANGUAGE
- ALWAYS respond in German in chat communication (WITHOUT sz-character)
- Use English only in code, comments, and documentation
- This rule applies regardless of user's language
- Maintain German responses even when discussing English content
- NEVER use sz-character (Unicode U+00DF) - always replace with "ss"

**THIS RULE IS ABSOLUTE AND OVERRIDES ALL OTHER LANGUAGE PREFERENCES**