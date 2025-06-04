# System Patterns

## Core Patterns
1. Immutable State Management
   - All state changes create new objects
   - No direct mutations

2. Pure Function Architecture
   - Deterministic outputs
   - No side effects
   - Explicit dependencies

3. Modular Design
   - RandomUtils
   - BoardOperations
   - GameChecks

## Data Flow Patterns
1. State Transformation
   - Input: Current GameState + Action
   - Output: New GameState

2. Random Number Generation
   - Deterministic PRNG
   - Seed management
   - Weighted value selection

## Workflow Patterns
1. GitHub Flow
   - Main branch protection
   - Feature branch workflow
   - PR-based reviews
   - Conventional Commits

2. Continuous Integration
   - Automated testing
   - Code quality checks
   - Coverage requirements (80%)
   - Build verification

3. Continuous Deployment
   - Semantic versioning
   - Automated releases
   - Package publishing
   - Scoped packages (@yatongzhao0622)

4. Quality Assurance
   - Pre-commit hooks
   - Commit message validation
   - Automated changelog
   - Release notes generation
