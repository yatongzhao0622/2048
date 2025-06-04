# **CI/CD 流程规范 - 2048游戏核心JavaScript库 (v2)**

## **1. 概述**

本文档旨在为 "2048游戏核心JavaScript库" 定义一套标准的持续集成与持续部署（CI/CD）流程。该流程的核心目标是自动化代码的构建、测试、版本控制和发布过程，确保代码质量，并高效地将库发布到GitHub Packages。此版本基于明确的选型和需求进行修订。

本文档是 "2048游戏核心JavaScript库 - 精确函数式规范与系统架构 (v2)" 的补充。

## **2. 先决条件**

- **Node.js 与 npm/yarn**: 开发和构建环境需要安装Node.js (推荐使用最新的LTS版本)，并选择npm或yarn作为包管理器。
- **GitHub 仓库**: 项目代码托管在GitHub仓库中。
- **代码编辑器**: 如VS Code。
- **Git**: 版本控制系统。
- **TypeScript**: 项目将使用TypeScript进行开发。

## **3. 版本控制与发布策略**

- **语义化版本控制 (Semantic Versioning - SemVer)**: 严格遵循 `主版本号.次版本号.修订号` (MAJOR.MINOR.PATCH) 的格式。
- **自动化版本管理与发布**:
    - **`semantic-release`**: 项目将使用 `semantic-release` 工具。该工具会根据推送到主发布分支 (`main`) 的提交信息（需遵循Conventional Commits规范）自动分析、确定新的版本号、生成Git标签、创建GitHub Release，并发布NPM包到GitHub Packages。
    - **变更日志**: `semantic-release` 将自动根据提交信息生成和更新 `CHANGELOG.md` 文件。

## **4. CI/CD 流水线概览**

流水线的主要步骤如下：

1. **代码提交 (Push)**: 开发者将代码推送到GitHub仓库的功能分支。
2. **拉取请求 (Pull Request)**: 创建PR到 `main` 分支。
3. **自动化检查 (CI Triggered on PR to `main`)**:
    - **代码风格检查 (Linting)**: 使用ESLint等工具检查代码风格。
    - **单元测试 (Unit Testing)**: 使用Jest等框架运行单元测试。
    - **测试覆盖率检查**: 确保测试覆盖率达到至少80%。如果低于此阈值，CI构建将失败。
    - **构建 (Build)**: 使用TypeScript编译器 (`tsc`) 将代码编译为JavaScript。
4. **合并到主分支 (Merge to `main`)**: PR审核通过后，合并到 `main` 分支。
5. **自动化发布流程 (CD Triggered on Push to `main`)**:
    - **`semantic-release` 执行**:
        - 分析提交记录。
        - 确定新版本号。
        - 更新 `package.json` 中的版本号（在CI环境中，通常不会直接提交回仓库，而是用于发布）。
        - 创建Git版本标签。
        - 生成或更新 `CHANGELOG.md`。
        - 将NPM包发布到GitHub Packages。
        - 创建GitHub Release条目。

## **5. GitHub Actions 配置**

在项目根目录下创建 `.github/workflows/release.yml` (或类似名称) 文件。

```
# .github/workflows/release.yml
name: Release Package to GitHub Packages

on:
  push:
    branches:
      - main # 仅在 main 分支上触发发布流程

jobs:
  test-build: # CI部分：在PR和推送到main时运行测试和构建
    name: Test and Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js (Latest LTS)
        uses: actions/setup-node@v4
        with:
          node-version: 'lts/*' # 使用最新的LTS Node.js 版本
          cache: 'npm' # 或 'yarn'

      - name: Install dependencies
        run: npm ci # 或者 yarn install --frozen-lockfile

      - name: Lint code
        run: npm run lint # 假设 package.json 中有 lint 脚本

      - name: Run tests with coverage
        run: npm run test:coverage # 假设 test:coverage 脚本会生成覆盖率报告

      - name: Check test coverage (80%)
        # 此步骤依赖于测试脚本如何输出或存储覆盖率结果。
        # 例如，使用 jest-coverage-reporter 或类似工具在测试后检查。
        # 一个简化的示例是假设你的测试框架可以将覆盖率摘要输出到stdout，然后用grep检查。
        # 更健壮的方法是使用专门的Action或工具来解析覆盖率报告 (如LCOV)。
        # 以下为概念性演示，具体实现需根据测试工具调整：
        run: |
          echo "Checking coverage..."
          # 假设 npm run test:coverage 生成了 coverage/lcov-report/index.html
          # 并且 jest 的 coverageSummaryReporter (默认) 或类似工具会输出摘要
          # 你可能需要解析 coverage/coverage-summary.json
          # 例如，使用 `npx jest --coverage --coverageReporters="json-summary" && node check-coverage.js`
          # check-coverage.js 脚本:
          # const summary = require('./coverage/coverage-summary.json');
          # const coverage = summary.total.lines.pct;
          # if (coverage < 80) {
          #   console.error(`Test coverage is ${coverage}%, which is below the 80% threshold.`);
          #   process.exit(1);
          # }
          # console.log(`Test coverage is ${coverage}%.`);
          # 为简化，此处仅为占位符，实际项目中需具体实现覆盖率检查逻辑
          if ! npm run test:coverage | grep -q "All files.*100% Lines"; then # 这是一个非常简化的例子
             echo "Coverage check placeholder: Implement actual coverage check against 80% threshold."
             # exit 1 # 在实际配置中，如果未达到阈值则取消注释以使构建失败
          fi

      - name: Build project
        run: npm run build # 运行TypeScript编译

  publish:
    name: Publish to GitHub Packages
    needs: test-build # 依赖于 test-build job 成功完成
    if: github.event_name == 'push' && github.ref == 'refs/heads/main' # 确保仅在推送到main时运行
    runs-on: ubuntu-latest
    permissions:
      contents: write # semantic-release 需要写入权限来创建标签和Release
      packages: write # 发布到 GitHub Packages
      issues: write   # semantic-release 可能需要创建issue（可选）
      pull-requests: write # semantic-release 可能需要创建PR（可选）

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # semantic-release 需要完整的历史记录

      - name: Setup Node.js (Latest LTS)
        uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          registry-url: 'https://npm.pkg.github.com' # 设置 GitHub Packages 仓库地址
          scope: '@OWNER' # 替换为你的 GitHub 用户名或组织名

      - name: Install dependencies
        run: npm ci

      - name: Build project (again, or use artifacts from previous job)
        # 如果构建产物很大，可以考虑在 test-build job 中上传构建产物 (artifacts)
        # 然后在 publish job 中下载。为简单起见，这里重新构建。
        run: npm run build

      - name: Semantic Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }} # 对于 GitHub Packages，可以直接使用 GITHUB_TOKEN
        run: npx semantic-release

```

**注意**:

- 将 `@OWNER` 替换为你的GitHub用户名或组织名。
- `GITHUB_TOKEN` 是由GitHub Actions自动提供的。
- `semantic-release` 的具体配置可能需要在 `package.json` (通过 `release` 字段) 或独立的配置文件 (如 `.releaserc.json`, `.releaserc.yml`) 中定义。

## **6. `package.json` 配置**

确保 `package.json` 文件包含以下关键信息：

```
{
  "name": "@OWNER/your-package-name",
  "version": "0.0.0-development", // semantic-release 会自动更新此版本
  "description": "Core library for the 2048 game, implemented with a functional paradigm and TypeScript.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "lint": "eslint . --ext .js,.ts",
    "test": "jest",
    "test:coverage": "jest --coverage", // 生成覆盖率报告
    "build": "tsc -p tsconfig.json",
    "prepare": "npm run build", // npm publish 前自动运行 (本地发布时)
    "semantic-release": "semantic-release"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/OWNER/your-repository-name.git"
  },
  "publishConfig": {
    "access": "public", // 或 "restricted"
    "registry": "https://npm.pkg.github.com/"
  },
  "files": [
    "dist",
    "LICENSE",
    "README.md",
    "CHANGELOG.md"
  ],
  "keywords": [
    "2048",
    "game",
    "core",
    "logic",
    "functional",
    "typescript"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "devDependencies": {
    "@semantic-release/changelog": "^6.0.0", // 示例插件
    "@semantic-release/git": "^10.0.0",     // 示例插件
    "@semantic-release/github": "^9.0.0",   // 示例插件
    "semantic-release": "^21.0.0",          // 核心包
    "eslint": "latest",
    "jest": "latest",
    "typescript": "latest",
    "@types/jest": "latest",
    "ts-jest": "latest",
    "commitlint": "latest", // 用于提交信息规范
    "@commitlint/config-conventional": "latest",
    "husky": "latest" // 用于git钩子
  },
  "release": { // semantic-release 的基本配置示例
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      ["@semantic-release/npm", { "npmPublish": true }], // 确保它会发布到npm (此处是GitHub Packages)
      ["@semantic-release/github", {
        "assets": [ // 可选：将构建产物附加到GitHub Release
          {"path": "dist/**", "label": "Distribution"},
          {"path": "CHANGELOG.md"}
        ]
      }],
      ["@semantic-release/git", {
        "assets": ["package.json", "package-lock.json", "CHANGELOG.md"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }]
    ]
  }
}

```

## **7. 分支策略 (Branching Strategy)**

- **GitHub Flow**:
    - **`main`**: 此分支始终包含最新发布的、生产就绪的代码。所有开发都在特性分支上进行。`main` 分支受到保护，只接受来自特性分支并通过PR合并的代码。每次合并到 `main` 都会触发 `semantic-release` 发布流程。
    - **特性分支 (`feature/name-of-feature`, `fix/issue-description`, etc.)**: 从 `main` 分支创建，用于开发新功能或修复bug。开发完成后，创建一个拉取请求 (PR) 到 `main` 分支。PR中会运行CI检查（linting, tests, coverage, build）。审核通过并解决所有问题后，合并到 `main`。

## **8. 提交规范 (Commit Conventions)**

- **强制使用 Conventional Commits**: 所有合并到 `main` 分支的提交都**必须**遵循 Conventional Commits 规范 ([https://www.conventionalcommits.org/](https://www.conventionalcommits.org/))。
- **工具强制**:
    - **`commitlint`**: 用于校验提交信息是否符合规范。
    - **`husky`**: 用于设置Git钩子 (如 `commit-msg` 钩子)，在提交时自动运行 `commitlint`。

配置示例 (`package.json` 中已包含依赖，还需 `commitlint.config.js` 和 `husky` 设置):

```
// commitlint.config.js
module.exports = { extends: ['@commitlint/config-conventional'] };

```

在 `package.json` scripts 中添加 `"prepare": "husky install || true"` (如果使用 husky v7+)，并运行 `npm run prepare` 和 `npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'`。

## **9. 变更日志 (Changelog)**

- **自动生成**: `CHANGELOG.md` 文件将由 `semantic-release` (配合 `@semantic-release/changelog` 插件) 根据符合Conventional Commits规范的提交信息自动生成和更新。

## **10. 安全性**

- **`NODE_AUTH_TOKEN`**: 在GitHub Actions中，`secrets.GITHUB_TOKEN` 用于向与该仓库关联的GitHub Packages发布包。
- **依赖审查**: 定期审查项目依赖，使用 `npm audit` 或 `yarn audit` 来检查已知的安全漏洞，并及时更新依赖。CI流程中可以加入 `npm audit --audit-level=high` (或更高) 来自动检查。

## **11. 监控与回滚**

- **监控**: 主要监控GitHub Packages的下载量、GitHub仓库的issue报告等。
- **回滚**: `semantic-release` 通常不直接支持“回滚”已发布的版本。如果发布的版本存在严重问题：
    1. **立即修复**: 快速识别问题根源，在新的特性分支上修复，并通过正常的PR流程合并到 `main`。`semantic-release` 将自动发布一个新的补丁版本 (或适当的更高版本)。
    2. **弃用 (Deprecate)**: 如果需要，可以使用 `npm deprecate @OWNER/your-package-name@<problematic-version> "<message>"` 命令将有问题的版本标记为弃用。

通过实施上述CI/CD流程 (v2)，"2048游戏核心JavaScript库" 将拥有一个高度自动化、可靠且符合现代开发实践的构建、测试和发布体系。