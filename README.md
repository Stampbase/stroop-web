# Stroop Web

> The stroop.id web application — claim and manage your Stellar identity.

Part of [Stroop](https://github.com/Stampbase), an open identity layer for
Stellar, built by [Stampbase](https://github.com/Stampbase).

## Where this fits

`stroop-web` is the user-facing application for Stroop identities. It reads and
writes canonical identity state through the Stroop registry; it is not itself
the source of truth. Username rules and resolution semantics are specified in
[`stroop-docs`](https://github.com/Stampbase/stroop-docs) and enforced by
[`stroop-contracts`](https://github.com/Stampbase/stroop-contracts).

## Status

**Pre-alpha.** The username reservation landing page is implemented and runs
against a mock registry. No real registry, wallet authentication, or on-chain
claiming exists yet.

Nothing here is deployed to Stellar mainnet. Do not use any part of this
repository to custody value.

### Implemented today

- Username reservation landing page for `stroop.id`
- Username validation and canonical normalization shared by client and server
- Availability and reservation HTTP endpoints backed by an in-memory mock
- `IdentityRegistry` service interface with a mock adapter, so the transport can
  be replaced without touching components

### Experimental / not implemented

- Real registry-backed availability and claiming
- Wallet authentication and signature verification
- Profile management, wallet linking, payment destinations
- Public identity resolution routes

## Running it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Node.js 22 or newer. The app runs at `http://localhost:3000`.

## Testing

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Replacing the mock registry

Availability and reservation go through the `IdentityRegistry` interface in
`lib/registry/types.ts`. Nothing above that interface knows it is talking to a
mock. To go live, implement the interface against the deployed registry and
export it in place of `MockIdentityRegistry`.

`reserveUsername` already carries a `ReservationProof`. `authorizeReservation`
currently returns `{ kind: "none" }`; the `passport` and `stellar-signature`
variants exist on the type so real authentication becomes an authorizer
implementation plus enforcement in the route handler, not a rework of the flow.

## Security

Do not report vulnerabilities through public issues. See
[`SECURITY.md`](./SECURITY.md) for private reporting.

## License

[Apache-2.0](./LICENSE).

## Related repositories

| Repository | Purpose |
| --- | --- |
| [`stroop-contracts`](https://github.com/Stampbase/stroop-contracts) | Soroban contracts: identity registry, usernames, wallet links |
| [`stroop-sdk`](https://github.com/Stampbase/stroop-sdk) | `@stroop-id/sdk` and `@stroop-id/react` |
| [`stroop-web`](https://github.com/Stampbase/stroop-web) | stroop.id — identity application |
| [`stroopy`](https://github.com/Stampbase/stroopy) | stroopy.me — character application |
| [`stroop-docs`](https://github.com/Stampbase/stroop-docs) | Protocol specifications |
