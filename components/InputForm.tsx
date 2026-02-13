import React, { useState, useEffect } from 'react';
import { Search, Github, Lock } from 'lucide-react';

interface InputFormProps {
  onSubmit: (username: string, token?: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  // Auto-fill token from env if available (for easier local testing)
  useEffect(() => {
    let envToken = '';
    try {
      // @ts-ignore
      envToken = import.meta.env.VITE_GITHUB_TOKEN || process.env.REACT_APP_GITHUB_TOKEN || '';
    } catch (e) {}
    
    if (envToken) {
      setToken(envToken);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim(), token.trim() || undefined);
    }
  };

  const hasEnvToken = token && !showToken && token.length > 10;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          GitFolio AI
        </h1>
        <p className="text-gray-400">
          Analyze your GitHub profile with AI to catch a recruiter's eye.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">GitHub Username</label>
          <div className="relative">
            <Github className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. torvalds"
              className="w-full bg-slate-800/50 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        <div>
           <button 
             type="button" 
             onClick={() => setShowToken(!showToken)}
             className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mb-1"
           >
             <Lock size={12} /> 
             {showToken ? 'Hide GitHub Access Token' : hasEnvToken ? 'GitHub Token Loaded from Env' : 'Add GitHub Access Token (Optional)'}
           </button>
           
           {showToken && (
             <div className="relative animate-in fade-in slide-in-from-top-2">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="github_pat_..."
                className="w-full bg-slate-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Your 'github_pat_...' token. Only used locally to fetch public data.
              </p>
             </div>
           )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !username}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Analyze Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;