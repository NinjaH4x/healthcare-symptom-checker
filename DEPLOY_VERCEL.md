# Deploying to Vercel (automatic)

This project supports automatic deployment to Vercel via GitHub Actions. Vercel is recommended if you want full Next.js functionality (API routes, server/runtime features). GitHub Pages only serves a static export and cannot run API routes.

Steps to enable automatic deploys:

1. Create a Vercel account and team (https://vercel.com).
2. Import the GitHub repository into Vercel ("Import Project") and follow the prompts.
3. From the Vercel project settings, go to "General -> Git -> Integration" and copy the following values:
   - `VERCEL_ORG_ID` (Team/Organisation ID)
   - `VERCEL_PROJECT_ID` (Project ID)
4. Create a Vercel token:
   - Account Settings -> Tokens -> Create Token. Copy the token value.
   - This is `VERCEL_TOKEN`.
5. In your GitHub repository, go to Settings -> Secrets -> Actions and add these repository secrets:
   - `VERCEL_TOKEN` (value from step 4)
   - `VERCEL_ORG_ID` (value from step 3)
   - `VERCEL_PROJECT_ID` (value from step 3)
6. Push to `main` (or merge a PR). The workflow `.github/workflows/deploy-vercel.yml` will run and deploy the site to Vercel (production).

Notes:
- The workflow runs `npm run build` to verify the project builds before deploying.
- API routes at `/api/*` will work on Vercel; if you keep using GitHub Pages they will not.
- If you want preview deployments for branches/PRs, configure the workflow or connect Vercel's GitHub integration (the integration automatically provides previews).

If you'd like, I can also:
- Create a Vercel project for you (I need your Vercel token and permissions; not recommended to share tokens here). 
- Or walk you through the UI steps interactively.
