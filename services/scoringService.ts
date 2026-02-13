import { GitHubUser, GitHubRepo, ProfileScore, LanguageStats } from '../types';

export const calculateLanguageStats = (repos: GitHubRepo[]): LanguageStats[] => {
  const counts: Record<string, number> = {};
  let total = 0;

  repos.forEach(repo => {
    if (repo.language) {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
      total++;
    }
  });

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
};

export const calculateProfileScore = (user: GitHubUser, repos: GitHubRepo[]): ProfileScore => {
  const breakdown = {
    documentation: 0,
    codeQuality: 0,
    activity: 0,
    organization: 0,
    impact: 0,
    technicalDepth: 0
  };

  const details = {
    strengths: [] as string[],
    weaknesses: [] as string[]
  };

  // 1. Documentation (20 pts)
  // Bio presence
  if (user.bio && user.bio.length > 10) breakdown.documentation += 5;
  else details.weaknesses.push("Missing or short profile bio");
  
  // Blog/Link presence
  if (user.blog) breakdown.documentation += 5;

  // Repos with descriptions
  const reposWithDesc = repos.filter(r => r.description && r.description.length > 5).length;
  const descRatio = repos.length > 0 ? reposWithDesc / repos.length : 0;
  breakdown.documentation += Math.min(10, descRatio * 10);
  
  if (descRatio < 0.5) details.weaknesses.push("Many repositories lack descriptions");

  // 2. Code Quality & Best Practices (20 pts)
  // License usage
  const reposWithLicense = repos.filter(r => r.license).length;
  const licenseRatio = repos.length > 0 ? reposWithLicense / repos.length : 0;
  breakdown.codeQuality += Math.min(10, licenseRatio * 10);

  // Topics usage (indicates metadata care)
  const reposWithTopics = repos.filter(r => r.topics && r.topics.length > 0).length;
  breakdown.codeQuality += Math.min(10, (reposWithTopics / repos.length) * 10);

  // 3. Activity (20 pts)
  // Public repos count (capped at 10 pts for 20 repos)
  breakdown.activity += Math.min(10, user.public_repos * 0.5);
  
  // Recent activity (updated in last 30 days)
  const now = new Date();
  const recentRepos = repos.filter(r => {
    const updated = new Date(r.updated_at);
    const diffTime = Math.abs(now.getTime() - updated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;
  breakdown.activity += Math.min(10, recentRepos * 2); // 5 recent repos = max pts

  if (recentRepos === 0) details.weaknesses.push("No recent activity in the last 30 days");
  else details.strengths.push("Consistent recent activity");

  // 4. Organization (15 pts)
  // Not using default "patch-1" names etc (simple heuristic)
  const badNames = repos.filter(r => r.name.match(/patch-|untitled|test|hello-world/i)).length;
  if (badNames === 0) breakdown.organization += 5;
  
  // Has pinned repos? (API doesn't give this directly without scraping or graphql, assuming if top repos have stars/desc, it's organized)
  // We use detailed descriptions as a proxy for organization
  const avgDescLen = repos.reduce((acc, r) => acc + (r.description ? r.description.length : 0), 0) / (repos.length || 1);
  breakdown.organization += Math.min(10, avgDescLen / 5);

  // 5. Impact (15 pts)
  // Total stars
  const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
  breakdown.impact += Math.min(8, totalStars * 0.5); // 16 stars = max
  
  // Followers
  breakdown.impact += Math.min(7, user.followers * 0.5); // 14 followers = max

  if (totalStars > 10) details.strengths.push("Good community validation (Stars)");

  // 6. Technical Depth (10 pts)
  // Language diversity
  const languages = new Set(repos.map(r => r.language).filter(Boolean));
  if (languages.size >= 3) {
    breakdown.technicalDepth = 10;
    details.strengths.push("Demonstrates polyglot versatility");
  } else if (languages.size === 2) {
    breakdown.technicalDepth = 7;
  } else {
    breakdown.technicalDepth = 4;
  }

  // Calculate Total
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    total: Math.round(total),
    breakdown,
    details
  };
};