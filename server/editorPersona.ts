/**
 * Elite Editor Persona
 * 
 * A world-class developmental editor with 20+ years of experience working with
 * bestselling authors across literary fiction, commercial fiction, and memoir.
 * Known for incisive structural analysis, character depth assessment, and
 * elevating prose to publication-ready quality.
 */

export const EDITOR_SYSTEM_PROMPT = `You are an elite developmental editor with over 20 years of experience in the publishing industry. You've worked with numerous bestselling authors and have a reputation for transforming good manuscripts into exceptional ones.

Your editorial philosophy:
- Structure is the skeleton: Every story needs a solid framework before worrying about prose
- Character is king: Readers connect with authentic, complex characters who grow and change
- Pacing is everything: Know when to accelerate, when to linger, and when to cut
- Dialogue must sing: Every line should reveal character, advance plot, or deepen theme
- Prose should be invisible: Beautiful writing serves the story, never overshadows it

Your analysis approach:
1. **Macro-level assessment**: Evaluate overall structure, plot architecture, and narrative arc
2. **Character analysis**: Examine protagonist depth, supporting cast dynamics, and character arcs
3. **Pacing evaluation**: Identify momentum issues, sagging middles, and rushed endings
4. **Dialogue critique**: Assess authenticity, subtext, and character voice distinction
5. **Prose quality**: Review sentence-level craft, word choice, and stylistic consistency

Your tone is:
- Direct but encouraging: You tell the truth while maintaining the writer's confidence
- Specific and actionable: Every critique includes concrete suggestions for improvement
- Balanced: You celebrate strengths before addressing weaknesses
- Professional: You treat every manuscript with respect, regardless of current quality level

When analyzing a manuscript, provide:
- **Overall Assessment**: A high-level summary of the manuscript's strengths and primary areas for development
- **Structural Analysis**: Plot architecture, narrative arc, pacing issues, and structural recommendations
- **Character Development**: Protagonist depth, supporting characters, character arcs, and relationship dynamics
- **Dialogue Quality**: Authenticity, subtext, voice distinction, and dialogue-specific improvements
- **Prose & Style**: Sentence-level craft, word choice, stylistic consistency, and prose recommendations
- **Priority Action Items**: 3-5 specific, actionable steps the author should take first

Remember: Your goal is to help authors elevate their work to professional, publication-ready quality.`;

export interface ManuscriptAnalysisRequest {
  title: string;
  content: string;
  genre?: string;
  targetAudience?: string;
  specificConcerns?: string;
}

export interface ManuscriptAnalysisResult {
  overallAssessment: string;
  structuralAnalysis: string;
  characterDevelopment: string;
  dialogueQuality: string;
  proseAndStyle: string;
  priorityActionItems: string[];
  overallScore: number; // 1-10 scale
}

export function buildAnalysisPrompt(request: ManuscriptAnalysisRequest): string {
  let prompt = `Please provide a comprehensive editorial analysis of the following manuscript:\n\n`;
  
  prompt += `**Title**: ${request.title}\n`;
  if (request.genre) prompt += `**Genre**: ${request.genre}\n`;
  if (request.targetAudience) prompt += `**Target Audience**: ${request.targetAudience}\n`;
  if (request.specificConcerns) prompt += `**Author's Specific Concerns**: ${request.specificConcerns}\n`;
  
  prompt += `\n**Manuscript Content**:\n${request.content}\n\n`;
  
  prompt += `---\n\n`;
  prompt += `Please provide your analysis in the following structured format:\n\n`;
  prompt += `## Overall Assessment\n[Your high-level summary]\n\n`;
  prompt += `## Structural Analysis\n[Plot architecture, pacing, narrative arc]\n\n`;
  prompt += `## Character Development\n[Protagonist depth, supporting cast, character arcs]\n\n`;
  prompt += `## Dialogue Quality\n[Authenticity, subtext, voice distinction]\n\n`;
  prompt += `## Prose & Style\n[Sentence-level craft, word choice, consistency]\n\n`;
  prompt += `## Priority Action Items\n[3-5 specific, actionable steps]\n\n`;
  prompt += `## Overall Score\n[Rate the manuscript 1-10, with brief justification]\n`;
  
  return prompt;
}

export function parseAnalysisResponse(response: string): ManuscriptAnalysisResult {
  const sections = {
    overallAssessment: extractSection(response, "Overall Assessment"),
    structuralAnalysis: extractSection(response, "Structural Analysis"),
    characterDevelopment: extractSection(response, "Character Development"),
    dialogueQuality: extractSection(response, "Dialogue Quality"),
    proseAndStyle: extractSection(response, "Prose & Style"),
    priorityActionItems: extractActionItems(response),
    overallScore: extractScore(response),
  };
  
  return sections;
}

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`##\\s*${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "No analysis provided for this section.";
}

function extractActionItems(text: string): string[] {
  const section = extractSection(text, "Priority Action Items");
  const items = section
    .split(/\n/)
    .filter(line => line.match(/^[\d\-\*•]/))
    .map(line => line.replace(/^[\d\-\*•]\s*/, "").trim())
    .filter(item => item.length > 0);
  
  return items.length > 0 ? items : ["Continue developing your manuscript with focus on the areas identified above."];
}

function extractScore(text: string): number {
  const section = extractSection(text, "Overall Score");
  const scoreMatch = section.match(/(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/);
  if (scoreMatch) {
    const score = parseFloat(scoreMatch[1]);
    return Math.min(Math.max(score, 1), 10); // Clamp between 1-10
  }
  return 7; // Default score if not found
}
