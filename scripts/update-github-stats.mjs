import { mkdir, writeFile } from "node:fs/promises";

const username = process.env.GITHUB_STATS_USERNAME || "barrydoooit";
const token = process.env.GH_STATS_TOKEN || process.env.GITHUB_TOKEN;
const outputPath = process.env.GITHUB_STATS_OUTPUT || "data/github-stats.json";

if (!token) {
  throw new Error("Missing GH_STATS_TOKEN or GITHUB_TOKEN.");
}

const to = new Date();
const from = new Date(to);
from.setDate(from.getDate() - 30);

const query = `
  query UserContributionStats($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        restrictedContributionsCount
        commitContributionsByRepository(maxRepositories: 100) {
          repository {
            nameWithOwner
            isPrivate
            url
          }
          contributions {
            totalCount
          }
        }
      }
    }
    rateLimit {
      remaining
      resetAt
    }
  }
`;

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "barryhomepage-github-stats",
  },
  body: JSON.stringify({
    query,
    variables: {
      login: username,
      from: from.toISOString(),
      to: to.toISOString(),
    },
  }),
});

if (!response.ok) {
  throw new Error(`GitHub GraphQL request failed: ${response.status} ${response.statusText}`);
}

const payload = await response.json();

if (payload.errors?.length) {
  throw new Error(`GitHub GraphQL errors: ${JSON.stringify(payload.errors)}`);
}

const collection = payload.data?.user?.contributionsCollection;

if (!collection) {
  throw new Error(`GitHub user not found or inaccessible: ${username}`);
}

const repositories = collection.commitContributionsByRepository.map((entry) => ({
  nameWithOwner: entry.repository.nameWithOwner,
  isPrivate: entry.repository.isPrivate,
  url: entry.repository.isPrivate ? null : entry.repository.url,
  commitCount: entry.contributions.totalCount,
}));

const stats = {
  username,
  from: from.toISOString(),
  to: to.toISOString(),
  commitCountLast30Days: collection.totalCommitContributions,
  restrictedContributionsLast30Days: collection.restrictedContributionsCount,
  generatedAt: new Date().toISOString(),
  source: "github-graphql-contributions",
  rateLimit: payload.data.rateLimit,
  repositories,
};

await mkdir(outputPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outputPath, `${JSON.stringify(stats, null, 2)}\n`);

console.log(`Wrote ${outputPath} for ${username}: ${stats.commitCountLast30Days} commits in 30 days.`);
