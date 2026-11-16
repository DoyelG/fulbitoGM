# Migration: move the existing data into a tournament

Since multi-tenant tournaments, every player, match, match player, clip and court needs a `tournamentId`. The Firestore rules deny reading a document that has none, so the data created before tournaments stays hidden until it is migrated.

`scripts/migrate-to-tournament.mjs` does it in one pass:

- Creates the tournament (`tournaments/gm2` by default) if it does not exist.
- Adds every user in `users` as a member: the `--owner` as `OWNER`, each `--admin` as `ADMIN`, everyone else as `MEMBER`.
- Links each member to their player: `users.linkedPlayerId` first, then the player whose `linkedUserId` is that user. One player per member.
- Sets `tournamentId` on every document of `players`, `matches`, `matchPlayers`, `videoClips` and `addresses` that has none.

It never overwrites anything: existing members, links and documents that already have a `tournamentId` are left as they are, so running it again is safe.

## Before running it

- The owner and the admins must have signed in at least once, so they have a `users` document.
- Against the real project the script authenticates with `gcloud auth print-access-token` (or `FIRESTORE_ACCESS_TOKEN`). The account needs write access to Firestore in `fulbitogm`. That token bypasses the security rules.

## Steps

1. Deploy the indexes and wait until they finish building in Firebase Console:

   ```bash
   pnpm dlx firebase-tools deploy --only firestore:indexes
   ```

2. Dry run. Check the member list and the counts:

   ```bash
   node scripts/migrate-to-tournament.mjs --name "Torneo GM2" --owner doyel.gusmerotti@gm2dev.com --admin agustinwalas@gmail.com
   ```

3. Deploy the rules and the web app together, then apply right away:

   ```bash
   pnpm dlx firebase-tools deploy --only firestore:rules,storage
   ```

   ```bash
   node scripts/migrate-to-tournament.mjs --name "Torneo GM2" --owner doyel.gusmerotti@gm2dev.com --admin agustinwalas@gmail.com --apply
   ```

4. Run the dry run again. Every collection should report `0 of N` documents without `tournamentId`. If something was created in between by an old build, apply again.

Old mobile builds don't send `tournamentId`, so they stop working once the new rules are live. Publish the new mobile build at the same time.

## Trying it on the emulator

```bash
node scripts/migrate-to-tournament.mjs --name "Torneo GM2" --owner test@test.com --admin test2@test.com --emulator
```
