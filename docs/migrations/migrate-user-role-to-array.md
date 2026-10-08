# Migration: user `role` from string to array

Before: `role: 'ADMIN'` (string)
After: `role: ['ADMIN']` (array)

The code and the Firestore rules accept both formats, so this migration is optional. Do it to clean up the data.

## When to run it

Only after the new web and mobile versions are live for everyone. Old mobile builds read `role` as a string, and an array breaks them (admins lose their admin features).

## Steps

1. Open Firebase Console, then Firestore Database, then the `users` collection.
2. Find the documents where `role` is a `string`. Start with the admins.
3. Write down each document id and its role, in case you need to go back.
4. Edit the `role` field: change its type to `array` and add one item with the same value (`ADMIN`, `PLAYER` or `USER`).
5. Save.

Users with `role: 'USER'` can stay as a string. It works the same.