// GitHub API Types
export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
    node_id: string;
  } | null;
  topics: string[];
}

// Application Types
export interface LanguageStats {
  name: string;
  count: number;
  percentage: number;
}

export interface ProfileScore {
  total: number;
  breakdown: {
    documentation: number; // 20%
    codeQuality: number;   // 20%
    activity: number;      // 20%
    organization: number;  // 15%
    impact: number;        // 15%
    technicalDepth: number;// 10%
  };
  details: {
    strengths: string[];
    weaknesses: string[];
  };
}

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  readmeFeedback: {
    repoName: string;
    clarityScore: number;
    feedback: string;
  }[];
}

export interface FullAnalysisData {
  user: GitHubUser;
  repos: GitHubRepo[];
  languages: LanguageStats[];
  score: ProfileScore;
  aiAnalysis: AIAnalysisResult | null;
}