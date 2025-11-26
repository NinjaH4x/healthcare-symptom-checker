/**
 * next.config.js
 * Configure Next.js for static export suitable for GitHub Pages.
 * When running inside GitHub Actions the GITHUB_REPOSITORY env var is available
 * and we'll set basePath/assetPrefix so the exported site works as a project page.
 */
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
const isProjectPage = !!repoName;

module.exports = {
  output: 'export',
  trailingSlash: true,
  // For GitHub Pages project sites (username.github.io/repo), set basePath and assetPrefix
  basePath: isProjectPage ? `/${repoName}` : '',
  assetPrefix: isProjectPage ? `/${repoName}/` : '',
};
