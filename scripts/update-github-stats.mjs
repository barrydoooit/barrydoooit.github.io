import { mkdir, writeFile } from "node:fs/promises";

const username = process.env.GITHUB_STATS_USERNAME || "barrydoooit";
const token = process.env.GH_STATS_TOKEN || process.env.GITHUB_TOKEN;
const outputPath = process.env.GITHUB_STATS_OUTPUT || "data/github-stats.json";
const includeForks = process.env.GITHUB_STATS_INCLUDE_FORKS === "true";
const apiBase = "https://api.github.com";

if (!token) {
  throw new Error("Missing GH_STATS_TOKEN or GITHUB_TOKEN.");
}

const to = new Date();
const from = new Date(to);
from.setDate(from.getDate() - 30);

async function githubJson(path) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "barryhomepage-github-stats",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed for ${path}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function pagedGithubJson(path) {
  const items = [];
  let page = 1;

  while (true) {
    const separator = path.includes("?") ? "&" : "?";
    const pageItems = await githubJson(`${path}${separator}per_page=100&page=${page}`);

    if (!Array.isArray(pageItems) || pageItems.length === 0) {
      return items;
    }

    items.push(...pageItems);

    if (pageItems.length < 100) {
      return items;
    }

    page += 1;
  }
}

async function listRepositories() {
  const repos = await pagedGithubJson("/user/repos?affiliation=owner&visibility=all&sort=updated&direction=desc");
  return repos.filter((repo) => repo.owner?.login === username && (includeForks || !repo.fork));
}

async function listBranches(repoFullName) {
  return pagedGithubJson(`/repos/${repoFullName}/branches`);
}

async function listBranchCommits(repoFullName, branchName) {
  const params = new URLSearchParams({
    sha: branchName,
    since: from.toISOString(),
    until: to.toISOString(),
    author: username,
  });

  return pagedGithubJson(`/repos/${repoFullName}/commits?${params.toString()}`);
}

const repos = await listRepositories();
const publicRepositories = [];
let publicCommitCount = 0;
let privateCommitCount = 0;
let branchCount = 0;
const seenCommits = new Set();

for (const repo of repos) {
  const branches = await listBranches(repo.full_name);
  const publicRepoCommitShas = new Set();
  branchCount += branches.length;

  for (const branch of branches) {
    const commits = await listBranchCommits(repo.full_name, branch.name);

    for (const commit of commits) {
      if (!commit.sha || seenCommits.has(commit.sha)) continue;

      seenCommits.add(commit.sha);

      if (repo.private) {
        privateCommitCount += 1;
      } else {
        publicCommitCount += 1;
        publicRepoCommitShas.add(commit.sha);
      }
    }
  }

  if (!repo.private && publicRepoCommitShas.size > 0) {
    publicRepositories.push({
      nameWithOwner: repo.full_name,
      isPrivate: false,
      url: repo.html_url,
      commitCount: publicRepoCommitShas.size,
    });
  }
}

const stats = {
  username,
  from: from.toISOString(),
  to: to.toISOString(),
  commitCountLast30Days: publicCommitCount + privateCommitCount,
  publicCommitCountLast30Days: publicCommitCount,
  privateCommitCountLast30Days: privateCommitCount,
  generatedAt: new Date().toISOString(),
  source: "github-rest-all-branches",
  repositoryCount: repos.length,
  branchCount,
  repositories: publicRepositories,
};

await mkdir(outputPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outputPath, `${JSON.stringify(stats, null, 2)}\n`);

console.log(
  `Wrote ${outputPath} for ${username}: ${stats.commitCountLast30Days} commits in 30 days across ${repos.length} repos and ${branchCount} branches.`
);
