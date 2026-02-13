import React, { useState } from 'react';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import LoadingOverlay from './components/LoadingOverlay';
import { fetchGitHubProfile, fetchGitHubRepos, fetchRepoReadme } from './services/githubService';
import { calculateProfileScore, calculateLanguageStats } from './services/scoringService';
import { analyzeProfileWithGemini } from './services/geminiService';
import { FullAnalysisData } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FullAnalysisData | null>(null);

  const handleAnalyze = async (username: string, token?: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // 1. Fetch Basic Data
      const user = await fetchGitHubProfile(username, token);
      const repos = await fetchGitHubRepos(username, token);

      if (!repos || repos.length === 0) {
        throw new Error("No public repositories found for this user.");
      }

      // 2. Calculate Heuristic Stats
      const languages = calculateLanguageStats(repos);
      const score = calculateProfileScore(user, repos);

      // 3. Prepare AI Context (Top 3 repos by stars)
      const topRepos = [...repos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 3);
      
      const readmePromises = topRepos.map(async (repo) => {
        const content = await fetchRepoReadme(user.login, repo.name, token);
        return { repoName: repo.name, content: content || "" };
      });
      
      const readmes = await Promise.all(readmePromises);
      const validReadmes = readmes.filter(r => r.content.length > 0);

      // 4. AI Analysis
      // Note: This returns null if API key is missing or call fails, which triggers heuristic fallback in Dashboard
      const aiAnalysis = await analyzeProfileWithGemini(user, repos, validReadmes);

      // 5. Update State
      setData({
        user,
        repos,
        languages,
        score,
        aiAnalysis
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30">
      
      {/* Background Gradient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Navigation / Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-primary">Git</span>Folio<span className="text-secondary">AI</span>
          </div>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
            GitHub
          </a>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center">
          {loading ? (
            <LoadingOverlay />
          ) : data ? (
            <Dashboard data={data} onReset={handleReset} />
          ) : (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <InputForm onSubmit={handleAnalyze} isLoading={loading} />
              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm max-w-md text-center">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-gray-600 text-sm py-6">
          <p>© {new Date().getFullYear()} GitFolio AI. Built for developers.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;