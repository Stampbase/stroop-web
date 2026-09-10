# Security Policy

## Reporting a vulnerability

**Do not report vulnerabilities through public GitHub Issues, pull requests, or
discussions.**

Report privately through GitHub's private vulnerability reporting:

**https://github.com/Stampbase/stroop-web/security/advisories/new**

This repository has no published security email address. Private vulnerability
reporting on GitHub is the supported channel; if it is unavailable to you,
contact [@alexanderkoh](https://github.com/alexanderkoh) on GitHub and
ask for a private channel before sending any detail.

Please include:

- what the issue is and the impact you believe it has
- the affected component, version, or commit
- reproduction steps using synthetic data
- any proof-of-concept, kept to the minimum needed to demonstrate the problem

## What to expect

| | |
| --- | --- |
| Initial response | Within 5 working days |
| Triage decision | Within 10 working days of the initial response |
| Remediation target | Depends on severity; we will tell you the target and keep you updated |
| Disclosure | Coordinated with you once a fix is available |

Stroop is an early-stage project maintained by a small team. If a report goes
unacknowledged past these windows, please chase it — that is a failure on our
side, not an imposition on yours.

## Scope

Vulnerabilities we especially want to hear about:

- authorization bypass in profile ownership or controller logic
- wallet linking that does not prove control of the wallet
- signature verification bypass or replay
- username normalization collisions that allow impersonation
- payment destination redirection
- a testnet account being usable as a mainnet payment destination
- disclosure of private user data through public resolution

## Ground rules

- Do not exploit a vulnerability beyond what is necessary to demonstrate it.
- Do not access, modify, or exfiltrate data belonging to anyone else.
- Do not run denial-of-service or spam tests against deployed infrastructure.
- Give us reasonable time to remediate before public disclosure.

Acting in good faith under these rules, we will not pursue action against you
for your research.

## Supported versions

Stroop is pre-1.0 and under active development. Only the `main` branch and the
most recent release of any published package receive security fixes. There are
no long-term support branches yet.
