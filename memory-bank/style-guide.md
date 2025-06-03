# Style Guide

## Code Style
1. Function Naming
   - Pure functions: Start with verb (e.g., createGame, getBoard)
   - Internal functions: Prefix with underscore (e.g., _executeMoveOnBoard)

2. Type Annotations
   - Use TypeScript-style type annotations
   - Prefer ReadonlyArray for immutable arrays
   - Mark config objects as Readonly

3. Documentation
   - JSDoc for public API functions
   - Inline comments for complex algorithms
   - Clear parameter and return type documentation

4. Testing
   - Unit tests for pure functions
   - Property-based testing for game rules
   - Deterministic random number testing
