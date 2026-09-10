# CLAUDE.md — Stroop Web

Guidance for AI coding agents working in this repository. Everything here
applies to human contributors too; see `CONTRIBUTING.md` for the contributor
workflow and `SECURITY.md` for vulnerability reporting.

**This repository is public. Assume anything committed is permanently public,
even if it is deleted in a later commit.**

## Project integrity

- Read `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, and the relevant
  architecture documentation before making substantial changes.
- Understand the existing architecture before adding abstractions.
- Prefer small, reviewable changes.
- Do not silently change protocol semantics. A change to resolution, username
  rules, authorization, or payment behaviour is a protocol change and needs
  documentation and tests in the same pull request.
- Do not introduce new dependencies unless justified in the pull request.
- Do not duplicate functionality that exists in another Stroop repository.
- Preserve the separation between contracts, SDK, web applications, and docs.

## Git authorship

- **Never add Claude, Claude Code, or any AI tool as a co-author.**
- Never add `Co-Authored-By` trailers referring to Claude or any AI tool.
- Never add Claude Code signatures or "Generated with" lines.
- Never mention Claude Code in commit messages.
- Never add AI-generation metadata to pull request descriptions, issues,
  releases, source files, package metadata, or documentation.
- Use the repository's configured human Git identity.
- Do not modify global Git author configuration.
- Inspect the commit message before committing and confirm no AI attribution
  or co-author trailer is present.

## Secrets

- Never commit secrets of any kind.
- Never commit `.env`. Use `.env.example` with placeholder values only.
- Never commit Stellar secret seeds, private keys, or wallet mnemonics.
- Never commit authentication or session credentials.
- Never paste production credentials into tests or fixtures.
- Use fake, deterministic, clearly labelled test credentials where required.
- Inspect the staged diff before every commit.

## Privacy

- Never commit real Passport user data.
- Never commit emails, names, IP addresses, session identifiers, analytics
  exports, or any identifier belonging to a production user.
- Use synthetic test data.
- Commit public wallet addresses only where they are intentionally part of a
  public test fixture or a documented deployment.

## Security

- Treat authentication, wallet linking, profile ownership, usernames, payment
  resolution, and contract authorization as security-critical.
- Do not weaken authorization to make a test pass.
- Do not bypass signature verification.
- Do not introduce fallback authentication paths.
- Fail closed on authorization errors.
- Validate all untrusted input.
- Normalize usernames exactly once, through the canonical shared logic.
- Keep Stellar testnet and mainnet behaviour unambiguous. Never allow a testnet
  account to become a mainnet payment destination.
- Never describe an unresolved, exploitable vulnerability in a public issue or
  pull request. Use private security advisories — see `SECURITY.md`.

## Dependencies

- Prefer mature, actively maintained dependencies.
- Avoid packages with unnecessary install scripts.
- Keep lockfiles committed.
- Do not use unmaintained cryptography packages.
- Never implement custom cryptography where a vetted library or protocol
  primitive exists.
- Run dependency audit tooling before releases.
- Review newly introduced transitive dependencies.

## Web application rules

- Never expose server secrets through `NEXT_PUBLIC_*`. Anything with that
  prefix is compiled into the client bundle and is public.
- Never trust client-side validation for a security decision. The client result
  is advisory; the server and the canonical registry are authoritative.
- Use server-side validation for every mutation.
- Set safe response headers.
- Avoid rendering raw HTML from untrusted input.
- Avoid open redirects; validate URL parameters and username routing.
- Protect mutations against replay and CSRF where applicable.
- Do not log authentication payloads, signatures, or session material.
- Keep the registry behind a service interface so the transport can change
  without touching components.

## Before committing

1. `git status`
2. Inspect the staged file list
3. Inspect the staged diff
4. Verify no secrets are present
5. Verify no `.env` is staged
6. Run the tests
7. Run lint
8. Run typecheck or build where applicable
9. Write a concise commit message, conventional-commit style where it fits
10. Verify there is no AI or co-author attribution in the message

## Pull requests

Include purpose, scope, implementation notes, testing performed, security
implications, screenshots for user-visible changes, and the related issue.
Never put sensitive vulnerability details in a public pull request.

## Issues

Public issues must describe the desired behaviour and include acceptance
criteria. They must not contain private or internal context, funding or budget
discussion, exploitable vulnerability details, user data, or credentials.
