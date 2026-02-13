import { GoogleGenAI, Type } from "@google/genai";
import { GitHubUser, GitHubRepo, AIAnalysisResult } from "../types";

// Helper to truncate text to avoid token limits
const truncate = (str: string, length: number) => {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
};

export const analyzeProfileWithGemini = async (
  user: GitHubUser,
  repos: GitHubRepo[],
  readmes: { repoName: string; content: string }[]
): Promise<AIAnalysisResult | null> => {
  try {
    let apiKey = '';
    
    // Attempt 1: Check standard process.env (Next.js, CRA, Node)
    try {
      // @ts-ignore
      apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || process.env.REACT_APP_API_KEY;
    } catch (e) {
      // process is likely undefined
    }

    // Attempt 2: Check import.meta.env (Vite) if key is still missing
    if (!apiKey) {
      try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
           // @ts-ignore
           apiKey = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
        }
      } catch (e) {
        // import.meta is likely undefined
      }
    }

    // Validate Key Format
    if (!apiKey) {
      console.warn("Gemini API Key missing - falling back to heuristic analysis.");
      return null;
    }

    if (apiKey.startsWith("github_pat_") || apiKey.startsWith("ghp_")) {
      console.error("Configuration Error: A GitHub token was provided as the Gemini API Key.");
      return {
        summary: "Configuration Error: You have entered a GitHub Token into the AI API Key field. Please use a Google Gemini API Key for this feature.",
        strengths: ["Heuristic Analysis Only"],
        weaknesses: ["AI Configuration Invalid"],
        suggestions: ["Get a Gemini API Key from aistudio.google.com", "Update your .env file correctly"],
        readmeFeedback: []
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Select top 3 repos by stars for context
    const topRepos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map(r => ({
        name: r.name,
        description: r.description,
        language: r.language,
        topics: r.topics,
        stars: r.stargazers_count
      }));

    const readmeContext = readmes.length > 0
      ? readmes.map(r => `Repo: ${r.repoName}\nReadme Snippet: ${truncate(r.content, 1000)}`).join("\n---\n")
      : "No READMEs available.";

    const prompt = `
      Act as a strict Senior Technical Recruiter and Engineering Manager. 
      Analyze this GitHub profile data to determine employability and technical strength.
      
      User Bio: "${user.bio || "No bio provided"}"
      Location: "${user.location || "Not specified"}"
      Public Repos: ${user.public_repos}
      Followers: ${user.followers}
      
      Top Repositories:
      ${JSON.stringify(topRepos, null, 2)}
      
      README Contents (Snippets):
      ${readmeContext}

      Provide a structured JSON response with:
      1. A professional summary (2-3 sentences).
      2. Key strengths (3-5 bullet points).
      3. Critical weaknesses or red flags (3-5 bullet points).
      4. Actionable suggestions to improve the profile for job hunting (3-5 items).
      5. Specific feedback on the READMEs provided (clarity, structure).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            readmeFeedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  repoName: { type: Type.STRING },
                  clarityScore: { type: Type.NUMBER, description: "Score out of 10" },
                  feedback: { type: Type.STRING },
                },
                required: ["repoName", "clarityScore", "feedback"]
              }
            }
          },
          required: ["summary", "strengths", "weaknesses", "suggestions", "readmeFeedback"]
        }
      }
    });

    if (response.text) {
      let cleanText = response.text.trim();
      
      // Extract JSON if it's wrapped in text or markdown
      cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }

      return JSON.parse(cleanText) as AIAnalysisResult;
    }
    
    return null;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    // Return null to indicate failure, allowing Dashboard to use heuristic data
    return null;
  }
};