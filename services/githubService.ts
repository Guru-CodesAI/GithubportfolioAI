import { GitHubUser, GitHubRepo } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

export const fetchGitHubProfile = async (username: string, token?: string): Promise<GitHubUser> => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (token) {
    // Handle both classic tokens (ghp_) and fine-grained PATs (github_pat_)
    const scheme = token.startsWith('github_pat_') ? 'Bearer' : 'token';
    headers['Authorization'] = `${scheme} ${token}`;
  }

  const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, { headers });
  
  if (!response.ok) {
    if (response.status === 404) throw new Error('User not found');
    if (response.status === 401) throw new Error('Invalid GitHub Token. Please check your Access Token.');
    if (response.status === 403) throw new Error('API rate limit exceeded. Please provide a valid Access Token.');
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};

export const fetchGitHubRepos = async (username: string, token?: string): Promise<GitHubRepo[]> => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (token) {
    const scheme = token.startsWith('github_pat_') ? 'Bearer' : 'token';
    headers['Authorization'] = `${scheme} ${token}`;
  }

  // Fetch up to 100 repos sorted by updated time
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100&type=owner`, { headers });
  
  if (!response.ok) {
    if (response.status === 401) throw new Error('Invalid GitHub Token.');
    throw new Error('Failed to fetch repositories');
  }

  return response.json();
};

export const fetchRepoReadme = async (owner: string, repo: string, token?: string): Promise<string | null> => {
   const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3.raw', // Request raw content
  };
  
  if (token) {
    const scheme = token.startsWith('github_pat_') ? 'Bearer' : 'token';
    headers['Authorization'] = `${scheme} ${token}`;
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`, { headers });
    if (!response.ok) return null;
    return await response.text();
  } catch (e) {
    return null;
  }
};