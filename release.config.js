export default {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    ['@semantic-release/github', {
      assets: [
        { path: "dist/*.js", label: "JavaScript Distribution" },
        { path: "dist/*.d.ts", label: "TypeScript Declarations" },
        { path: "CHANGELOG.md", label: "Changelog" }
      ]
    }],
    '@semantic-release/git'
  ]
} 