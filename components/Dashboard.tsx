import React from 'react';
import { FullAnalysisData } from '../types';
import ScoreGauge from './ScoreGauge';
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Code2, 
  AlertTriangle,
  CheckCircle,
  Zap,
  FileText,
  Info
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { motion } from 'framer-motion';

interface DashboardProps {
  data: FullAnalysisData;
  onReset: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const { user, score, aiAnalysis, languages } = data;

  // Determine if we are using AI data or falling back to heuristics
  const usingFallback = !aiAnalysis;
  const strengths = aiAnalysis?.strengths || score.details.strengths;
  const weaknesses = aiAnalysis?.weaknesses || score.details.weaknesses;
  const suggestions = aiAnalysis?.suggestions || [
    "Add detailed READMEs to your top repositories.",
    "Contribute to open source projects to boost activity.",
    "Ensure all repositories have a description and topics.",
    "Add a professional bio and location to your profile."
  ];

  const scoreData = [
    { name: 'Documentation', value: score.breakdown.documentation, max: 20, color: '#60a5fa' },
    { name: 'Code Quality', value: score.breakdown.codeQuality, max: 20, color: '#34d399' },
    { name: 'Activity', value: score.breakdown.activity, max: 20, color: '#f472b6' },
    { name: 'Organization', value: score.breakdown.organization, max: 15, color: '#a78bfa' },
    { name: 'Impact', value: score.breakdown.impact, max: 15, color: '#fbbf24' },
    { name: 'Tech Depth', value: score.breakdown.technicalDepth, max: 10, color: '#f87171' },
  ];

  const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444'];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-center gap-6 glass-panel p-6 rounded-2xl"
      >
        <div className="flex items-center gap-6">
          <img src={user.avatar_url} alt={user.login} className="w-20 h-20 rounded-full border-2 border-primary" />
          <div>
            <h2 className="text-2xl font-bold text-white">{user.name || user.login}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-1">
              {user.company && <span className="flex items-center gap-1"><Briefcase size={14} /> {user.company}</span>}
              {user.location && <span className="flex items-center gap-1"><MapPin size={14} /> {user.location}</span>}
              <span className="flex items-center gap-1"><Users size={14} /> {user.followers} followers</span>
            </div>
            <p className="text-gray-300 mt-2 italic max-w-lg">{user.bio || "No bio available"}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={onReset}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-gray-300 transition-colors border border-gray-700"
          >
            Analyze Another
          </button>
          {usingFallback && (
            <span className="text-xs text-yellow-500 flex items-center gap-1">
              <Info size={12} /> AI Unavailable - Showing Heuristic Analysis
            </span>
          )}
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Score Card */}
        <motion.div variants={item} className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center md:col-span-1">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Portfolio Score</h3>
          <ScoreGauge score={score.total} />
          <div className="mt-4 text-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              score.total > 80 ? 'bg-green-500/20 text-green-300' :
              score.total > 60 ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {score.total > 80 ? 'Recruiter Ready' : score.total > 60 ? 'Needs Polish' : 'Needs Improvement'}
            </span>
          </div>
        </motion.div>

        {/* Breakdown Chart */}
        <motion.div variants={item} className="glass-panel p-6 rounded-2xl md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Score Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#334155', radius: [0, 4, 4, 0] }}>
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* Analysis Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Strengths & Weaknesses */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl h-full border-l-4 border-green-500">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
              <CheckCircle className="text-green-500" /> Strengths
            </h3>
            <ul className="space-y-3">
              {strengths.slice(0, 5).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  {s}
                </li>
              ))}
              {strengths.length === 0 && <li className="text-gray-500 italic">No specific strengths detected.</li>}
            </ul>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl h-full border-l-4 border-red-500">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
              <AlertTriangle className="text-red-500" /> Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {weaknesses.slice(0, 5).map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {w}
                </li>
              ))}
              {weaknesses.length === 0 && <li className="text-gray-500 italic">No critical weaknesses detected.</li>}
            </ul>
          </div>
        </div>

        {/* Action Plan */}
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap size={100} />
          </div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
            <Zap className="text-yellow-400" /> Recruiter's Action Plan
          </h3>
          
          <div className="space-y-6">
              {suggestions.map((suggestion, i) => (
                <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-gray-200 text-sm leading-relaxed">{suggestion}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </motion.div>

      {/* Languages Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-6 rounded-2xl"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-6">
          <Code2 className="text-blue-400" /> Language Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languages.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {languages.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                   itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {languages.slice(0, 6).map((lang, index) => (
              <div key={lang.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-gray-300 text-sm">{lang.name}</span>
                <span className="text-gray-500 text-xs ml-auto">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Readme Feedback - Only show if AI was successful */}
      {aiAnalysis?.readmeFeedback && aiAnalysis.readmeFeedback.length > 0 && (
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-6 rounded-2xl"
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-6">
              <FileText className="text-pink-400" /> README Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiAnalysis.readmeFeedback.map((fb, i) => (
                <div key={i} className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-blue-300">{fb.repoName}</h4>
                    <span className={`text-xs px-2 py-1 rounded bg-slate-700 ${fb.clarityScore >= 8 ? 'text-green-400' : 'text-yellow-400'}`}>
                      Clarity: {fb.clarityScore}/10
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{fb.feedback}</p>
                </div>
              ))}
            </div>
         </motion.div>
      )}

    </div>
  );
};

export default Dashboard;