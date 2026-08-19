export interface GithubCommitSummary {
  sha: string;
  authorName: string;
  authorEmail: string;
  authorLogin: string;
  message: string;
  date: string;
  url: string;
}

export interface PullRequestDiffStats {
  number: number;
  title: string;
  state: string;
  author: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  merged: boolean;
  htmlUrl: string;
}

export interface ProofOfWorkAudit {
  repo: string;
  branch: string;
  totalCommits: number;
  recentCommits: GithubCommitSummary[];
  pullRequests: PullRequestDiffStats[];
  totalAdditions: number;
  totalDeletions: number;
  totalChangedFiles: number;
  authorshipVerified: boolean;
  verifiedAuthorRatio: number;
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
   * Tool: Fetch commits with author email and login for identity verification
   */
  public static async getRepoCommits(
    repoInput: string,
    branch?: string,
    since?: string
  ): Promise<{ repo: string; commits: GithubCommitSummary[] }> {
    const { owner, repo } = this.parseRepoInput(repoInput);
    let url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`;
    if (branch) url += `&sha=${encodeURIComponent(branch)}`;
    if (since) url += `&since=${encodeURIComponent(since)}`;

    try {
      const response = await fetch(url, { headers: this.getHeaders() });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository '${owner}/${repo}' not found or is private.`);
        }
        if (response.status === 403) {
          throw new Error(`GitHub API rate limit reached. Set GITHUB_TOKEN in .env for unmetered access.`);
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const rawCommits = await response.json();
      const commits: GithubCommitSummary[] = (rawCommits || []).map((c: any) => ({
        sha: c.sha?.slice(0, 7) || "unknown",
        authorName: c.commit?.author?.name || c.author?.login || "Unknown",
        authorEmail: c.commit?.author?.email || "",
        authorLogin: c.author?.login || "",
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
   * Tool: Fetch Pull Requests with real diff stats (additions, deletions, changed files)
   */
  public static async getPullRequestsWithDiffStats(
    repoInput: string,
    state: "open" | "closed" | "all" = "all"
  ): Promise<PullRequestDiffStats[]> {
    const { owner, repo } = this.parseRepoInput(repoInput);
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=10`;

    try {
      const response = await fetch(url, { headers: this.getHeaders() });
      if (!response.ok) return [];
      const prs = await response.json();

      const diffStatsPromises = (prs || []).map(async (pr: any) => {
        let additions = 0;
        let deletions = 0;
        let changedFiles = 0;

        // Fetch detailed PR diff metrics if available
        try {
          const detailRes = await fetch(pr.url, { headers: this.getHeaders() });
          if (detailRes.ok) {
            const detail = await detailRes.json();
            additions = detail.additions || 0;
            deletions = detail.deletions || 0;
            changedFiles = detail.changed_files || 0;
          }
        } catch {
          // Fallback to basic summary
        }

        return {
          number: pr.number,
          title: pr.title,
          state: pr.state,
          author: pr.user?.login || "Unknown",
          additions,
          deletions,
          changedFiles,
          merged: Boolean(pr.merged_at),
          htmlUrl: pr.html_url,
        };
      });

      return await Promise.all(diffStatsPromises);
    } catch {
      return [];
    }
  }

  /**
   * Tool: Hardened Audit of Proof of Work
   * Validates authorship and evaluates code volume through PR diffs & lines changed
   */
  public static async auditProofOfWork(
    repoInput: string,
    milestoneCriteria: string,
    options?: {
      branch?: string;
      freelancerEmail?: string;
      freelancerLogin?: string;
    }
  ): Promise<ProofOfWorkAudit> {
    const branch = options?.branch || "main";
    const freelancerEmail = options?.freelancerEmail?.toLowerCase();
    const freelancerLogin = options?.freelancerLogin?.toLowerCase();

    try {
      const { commits, repo } = await this.getRepoCommits(repoInput, branch);
      const prs = await this.getPullRequestsWithDiffStats(repoInput, "all");

      const totalCommits = commits.length;
      const totalAdditions = prs.reduce((acc, pr) => acc + pr.additions, 0);
      const totalDeletions = prs.reduce((acc, pr) => acc + pr.deletions, 0);
      const totalChangedFiles = prs.reduce((acc, pr) => acc + pr.changedFiles, 0);

      // Authorship Validation: Verify author email or username against freelancer profile
      let authoredCommits = 0;
      for (const commit of commits) {
        const commitEmail = commit.authorEmail.toLowerCase();
        const commitLogin = commit.authorLogin.toLowerCase();
        const matchesEmail = freelancerEmail && commitEmail && (commitEmail === freelancerEmail || commitEmail.includes(freelancerEmail.split("@")[0] || ""));
        const matchesLogin = freelancerLogin && commitLogin && commitLogin === freelancerLogin;

        if (matchesEmail || matchesLogin || (!freelancerEmail && !freelancerLogin)) {
          authoredCommits++;
        }
      }

      const verifiedAuthorRatio = totalCommits > 0 ? authoredCommits / totalCommits : 0;
      const authorshipVerified = (!freelancerEmail && !freelancerLogin) || verifiedAuthorRatio >= 0.5;

      // Completion score based on code diff volume, authorship, and PR merges
      let completionScore = 0;
      if (totalCommits > 0) completionScore += Math.min(30, totalCommits * 6);
      if (totalAdditions > 20) completionScore += Math.min(35, Math.floor(totalAdditions / 10));
      if (prs.some((p) => p.merged)) completionScore += 25;
      if (authorshipVerified) completionScore += 10;
      completionScore = Math.min(100, completionScore);

      let recommendation: ProofOfWorkAudit["recommendation"] = "REQUEST_REVISIONS";
      if (completionScore >= 70 && authorshipVerified) {
        recommendation = "APPROVE_MILESTONE_RELEASE";
      } else if (completionScore < 30 || (!authorshipVerified && (freelancerEmail || freelancerLogin))) {
        recommendation = "INSUFFICIENT_PROOF_OF_WORK";
      }

      const auditSummary = `Audited ${totalCommits} commits and ${prs.length} PRs (${totalAdditions} additions, ${totalDeletions} deletions across ${totalChangedFiles} files). Authorship match: ${(verifiedAuthorRatio * 100).toFixed(0)}%.`;

      return {
        repo,
        branch,
        totalCommits,
        recentCommits: commits.slice(0, 5),
        pullRequests: prs,
        totalAdditions,
        totalDeletions,
        totalChangedFiles,
        authorshipVerified,
        verifiedAuthorRatio,
        completionScore,
        auditSummary,
        recommendation,
      };
    } catch (error: any) {
      return {
        repo: repoInput,
        branch,
        totalCommits: 0,
        recentCommits: [],
        pullRequests: [],
        totalAdditions: 0,
        totalDeletions: 0,
        totalChangedFiles: 0,
        authorshipVerified: false,
        verifiedAuthorRatio: 0,
        completionScore: 0,
        auditSummary: `Proof of Work audit exception: ${error.message}`,
        recommendation: "INSUFFICIENT_PROOF_OF_WORK",
      };
    }
  }
}
