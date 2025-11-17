# reflexion-reuse

Apply learning from past reflexions to a new context or task.

## Usage

```bash
/reflexion-reuse --reflexion-id <id> --new-context "<description>"
```

## Options

- `--reflexion-id` - ID of reflexion to reuse (required)
- `--new-context` - Description of new task/context (required)
- `--adapt` - Auto-adapt patterns to new context
- `--validate` - Validate pattern compatibility
- `--generate-plan` - Generate execution plan from reflexion

## Examples

### Reuse successful OAuth implementation
```bash
/reflexion-reuse \
  --reflexion-id reflex_9a3b7c2e \
  --new-context "Implement authentication for mobile app API"
```

### Adapt pattern with validation
```bash
/reflexion-reuse \
  --reflexion-id reflex_7d8f9e2a \
  --new-context "Apply same optimization to GraphQL endpoint" \
  --adapt --validate
```

### Generate execution plan
```bash
/reflexion-reuse \
  --reflexion-id reflex_4b2c8d1f \
  --new-context "Database migration for new service" \
  --generate-plan
```

## What This Does

1. **Retrieves Reflexion**: Loads full trajectory and patterns
2. **Context Analysis**: Compares old and new contexts
3. **Pattern Adaptation**: Adjusts patterns for new environment
4. **Validation**: Checks pattern compatibility
5. **Plan Generation**: Creates step-by-step execution plan
6. **Risk Assessment**: Identifies potential issues

The reuse process:
- Extracts successful patterns from original reflexion
- Identifies context differences
- Adapts patterns to new environment
- Validates technical compatibility
- Generates customized execution plan
- Highlights risks and mitigations

## When to Use

- **Similar Tasks**: Leverage proven approaches
- **Pattern Transfer**: Apply successful patterns to new domains
- **Onboarding**: Help new team members learn from past work
- **Acceleration**: Speed up implementation with proven templates
- **Risk Reduction**: Use validated approaches instead of experimenting

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Reflexion Reuse Analysis                                     ║
╠══════════════════════════════════════════════════════════════╣
║ Source Reflexion: reflex_9a3b7c2e                           ║
║ Original Task: OAuth2 User Authentication (Web App)         ║
║ New Context: Authentication for mobile app API              ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ CONTEXT COMPARISON                                           ║
╠══════════════════════════════════════════════════════════════╣
║ Similarities:                                                ║
║ ✓ OAuth2 authentication flow                                ║
║ ✓ JWT token management                                      ║
║ ✓ Supabase backend integration                              ║
║ ✓ API security requirements                                 ║
║                                                              ║
║ Differences:                                                 ║
║ ⚠ Mobile app vs web app                                     ║
║ ⚠ Native device storage vs browser cookies                  ║
║ ⚠ Different token refresh patterns                          ║
║ ⚠ Mobile-specific security considerations                   ║
╠══════════════════════════════════════════════════════════════╣
║ Compatibility Score: 0.87 (High - Good match)               ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ APPLICABLE PATTERNS                                          ║
╠══════════════════════════════════════════════════════════════╣
║ ✅ DIRECTLY APPLICABLE (No adaptation needed)               ║
╠══════════════════════════════════════════════════════════════╣
║ 1. Supabase batch operations                                ║
║    Impact: +60% efficiency                                   ║
║    Risk: None - Same backend                                 ║
║                                                              ║
║ 2. JWT validation pattern                                   ║
║    Impact: Enhanced security                                 ║
║    Risk: None - Standard JWT handling                        ║
║                                                              ║
║ 3. Error recovery with exponential backoff                  ║
║    Impact: +23% reliability                                  ║
║    Risk: None - Platform agnostic                            ║
╠══════════════════════════════════════════════════════════════╣
║ ⚠️  NEEDS ADAPTATION                                         ║
╠══════════════════════════════════════════════════════════════╣
║ 4. Token refresh handling                                   ║
║    Original: Browser cookie storage + silent refresh         ║
║    Adapted: Secure device storage + background refresh      ║
║    Risk: Low - Well-documented mobile pattern                ║
║                                                              ║
║ 5. Session management                                        ║
║    Original: Server-side session tracking                    ║
║    Adapted: Stateless JWT with device ID binding            ║
║    Risk: Medium - Requires careful implementation            ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ GENERATED EXECUTION PLAN                                     ║
╠══════════════════════════════════════════════════════════════╣
║ Phase 1: Setup (Est: 30m)                                    ║
║ ─────────────────────────────────────────────────────────────║
║ □ Configure Supabase auth for mobile app                    ║
║ □ Set up secure device storage for tokens                   ║
║ □ Configure OAuth2 providers (Google, Apple)                ║
║                                                              ║
║ 🎯 Pattern: Use Supabase auth configuration from original   ║
║                                                              ║
║ Phase 2: Core Authentication (Est: 1h 30m)                  ║
║ ─────────────────────────────────────────────────────────────║
║ □ Implement OAuth2 flow with device-specific callbacks      ║
║ □ Add JWT token validation middleware                       ║
║ □ Set up token refresh with background handling             ║
║                                                              ║
║ 🎯 Pattern: Reuse JWT validation from original              ║
║ ⚠️  Adapt: Browser cookies → Device secure storage          ║
║                                                              ║
║ Phase 3: Security Hardening (Est: 45m)                      ║
║ ─────────────────────────────────────────────────────────────║
║ □ Add device ID binding to tokens                           ║
║ □ Implement certificate pinning (mobile-specific)           ║
║ □ Add biometric authentication option                       ║
║                                                              ║
║ ⚠️  New: Mobile-specific security not in original           ║
║                                                              ║
║ Phase 4: Testing & Validation (Est: 1h)                     ║
║ ─────────────────────────────────────────────────────────────║
║ □ Test OAuth flows on iOS and Android                       ║
║ □ Validate token refresh in background                      ║
║ □ Security testing and penetration tests                    ║
║                                                              ║
║ 🎯 Pattern: Reuse test cases from original                  ║
╠══════════════════════════════════════════════════════════════╣
║ TOTAL ESTIMATED TIME: 3h 45m                                 ║
║ Original took: 2h 15m (mobile adds ~60% time)               ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ RISK ASSESSMENT                                              ║
╠══════════════════════════════════════════════════════════════╣
║ 🟢 LOW RISK                                                  ║
║    • Supabase integration (proven, same as original)         ║
║    • JWT validation (standard pattern)                       ║
║    • Error handling (platform agnostic)                      ║
║                                                              ║
║ 🟡 MEDIUM RISK                                               ║
║    • Token refresh adaptation (different storage model)      ║
║    • Session management changes (stateless vs stateful)      ║
║                                                              ║
║ 🔴 NEW AREAS (Not in original reflexion)                    ║
║    • Device ID binding (new security requirement)            ║
║    • Certificate pinning (mobile-specific)                   ║
║    • Platform differences (iOS vs Android)                   ║
║                                                              ║
║ Mitigation:                                                  ║
║ • Follow mobile OAuth best practices                         ║
║ • Test thoroughly on both platforms                          ║
║ • Review mobile security guidelines                          ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ LEARNING OPPORTUNITIES                                       ║
╠══════════════════════════════════════════════════════════════╣
║ This reuse will generate new learning:                       ║
║ • Mobile-specific auth patterns                              ║
║ • Cross-platform token management                            ║
║ • Device storage security patterns                           ║
║                                                              ║
║ 💡 Tip: Track this as new reflexion to capture mobile       ║
║    adaptations for future mobile projects.                   ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ RECOMMENDATIONS                                              ║
╠══════════════════════════════════════════════════════════════╣
║ 1. ✅ Proceed with reuse - High compatibility (87%)         ║
║ 2. 🎯 Focus on adapting token storage and refresh           ║
║ 3. 📚 Research mobile OAuth best practices for new areas    ║
║ 4. ✅ Reuse Supabase patterns directly (proven success)     ║
║ 5. 📊 Track new reflexion to capture mobile learnings       ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/reflexion-search` - Find reflexions to reuse
- `/reflexion-track` - Track new reflexion from reuse
- `/iris-patterns` - View pattern library
- `/pattern-transfer` - Transfer patterns between projects
