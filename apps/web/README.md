This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication setup

This app includes credentials-based authentication (username + password) with two roles: `USER` (read-only) and `ADMIN` (full access).

1. Configure environment variables in `.env`:

```
DATABASE_URL="postgres://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_a_strong_secret"
```

2. Apply Prisma changes and generate the client:

```
npx prisma migrate dev
```

3. Create your first user at `/login` (Registration tab). New users get `USER` role by default.

4. Promote an account to admin manually (one-time), for example via Prisma Studio:

```
npx prisma studio
# Open User table, set role to ADMIN for the desired user
```

Admin-only actions include creating, editing and deleting players and matches, and uploading images. Regular users can view everything but cannot modify data.
