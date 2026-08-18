export interface GithubCommitSummary {
  sha: string;
  author: string;
  message: string;
  date: string;
  url: string;
}

export interface ProofOfWorkAudit {
  repo: string;
  branch: string;
  totalCommits: number;
  recentCommits: GithubCommitSummary[];
  pullRequestsCount: number;
  meetsMilestoneCriteria: boolean;
  completionScore: number;
  auditSummary: string;
  recommendation: "APPROVE_MILESTONE_RELEASE" | "REQUEST_REVISIONS" | "INSUFFICIENT_PROOF_OF_WORK";
}

export class GitHubProofOfWorkTools {
  private static getHeaders(): HeadersInit {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      "User-Agent": "PayShield-ProofOfWork-Agent",
      Accept: "application/vnd.github.v3+json",
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    return headers;
  }

  private static parseRepoInput(repoInput: string): { owner: string; repo: string } {
    let clean = repoInput.trim();
    if (clean.startsWith("https://github.com/")) {
      clean = clean.replace("https://github.com/", "");
    }
    const parts = clean.split("/").filter(Boolean);
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      throw new Error(`Invalid GitHub repository format: '${repoInput}'. Expected 'owner/repo' or GitHub URL.`);
    }
    return { owner: parts[0], repo: parts[1].replace(".git", "") };
  }

  /**
   * Tool: Fetch commits from a GitHub repository
   */
  public static async getRepoCommits(
    repoInput: string,
    branch?: string,
    since?: string
  ): Promise<{ repo: string; commits: GithubCommitSummary[] }> {
    const { owner, repo } = this.parseRepoInput(repoInput);
    let url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=15`;
    if (branch) url += `&sha=${encodeURIComponent(branch)}`;
    if (since) url += `&since=${encodeURIComponent(since)}`;

    try {
      const response = await fetch(url, { headers: this.getHeaders() });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository '${owner}/${repo}' not found or is private.`);
        }
        if (response.status === 403) {
          throw new Error(`GitHub API rate limit exceeded. Consider setting GITHUB_TOKEN.`);
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const rawCommits = await response.json();
      const commits: GithubCommitSummary[] = (rawCommits || []).map((c: any) => ({
        sha: c.sha?.slice(0, 7) || "unknown",
        author: c.commit?.author?.name || c.author?.login || "Unknown",
        message: c.commit?.message?.split("\n")[0] || "",
        date: c.commit?.author?.date || "",
        url: c.html_url || "",
      }));

      return { repo: `${owner}/${repo}`, commits };
    } catch (error: any) {
      throw new Error(`GitHub commits query failed: ${error.message}`);
    }
  }

  /**
   * Tool: Fetch pull requests
   */
  public static async getPullRequests(
    repoInput: string,
    state: "open" | "closed" | "all" = "all"
  ): Promise<any[]> {
    const { owner, repo } = this.parseRepoInput(repoInput);
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=10`;

    try {
      const response = await fetch(url, { headers: this.getHeaders() });
      if (!response.ok) return [];
      const prs = await response.json();
      return (prs || []).map((pr: any) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        user: pr.user?.login,
        createdAt: pr.created_at,
        mergedAt: pr.merged_at,
        htmlUrl: pr.html_url,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Tool: Audit freelancer Proof-of-Work against milestone criteria
   */
  public static async auditProofOfWork(
    repoInput: string,
    milestoneCriteria: string,
    branch: string = "main"
  ): Promise<ProofOfWorkAudit> {
    try {
      const { commits, repo } = await this.getRepoCommits(repoInput, branch);
      const prs = await this.getPullRequests(repoInput, "all");

      const criteriaKeywords = milestoneCriteria.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
      let matchCount = 0;

      for (const commit of commits) {
        const msg = commit.message.toLowerCase();
        for (const kw of criteriaKeywords) {
          if (msg.includes(kw)) {
            matchCount++;
          }
        }
      }

      const totalCommits = commits.length;
      let completionScore = Math.min(100, totalCommits * 8 + matchCount * 12 + prs.length * 15);

      if (totalCommits === 0) {
        return {
          repo,
          branch,
          totalCommits: 0,
          recentCommits: [],
          pullRequestsCount: prs.length,
          meetsMilestoneCriteria: false,
          completionScore: 0,
          auditSummary: "No recent commits detected in repository branch.",
          recommendation: "INSUFFICIENT_PROOF_OF_WORK",
        };
      }

      const meetsMilestoneCriteria = totalCommits >= 2 && completionScore >= 50;
      let recommendation: ProofOfWorkAudit["recommendation"] = "REQUEST_REVISIONS";

      if (completionScore >= 75) {
        recommendation = "APPROVE_MILESTONE_RELEASE";
      } else if (completionScore < 30) {
        recommendation = "INSUFFICIENT_PROOF_OF_WORK";
      }

      return {
        repo,
        branch,
        totalCommits,
        recentCommits: commits.slice(0, 5),
        pullRequestsCount: prs.length,
        meetsMilestoneCriteria,
        completionScore,
        auditSummary: `Found ${totalCommits} commits and ${prs.length} PRs. Commit messages show ${matchCount} direct keyword matches to milestone criteria ('${milestoneCriteria.slice(0, 40)}...').`,
        recommendation,
      };
    } catch (error: any) {
      return {
        repo: repoInput,
        branch,
        totalCommits: 0,
        recentCommits: [],
        pullRequestsCount: 0,
        meetsMilestoneCriteria: false,
        completionScore: 0,
        auditSummary: `Proof of Work verification error: ${error.message}`,
        recommendation: "INSUFFICIENT_PROOF_OF_WORK",
      };
    }
  }
}
