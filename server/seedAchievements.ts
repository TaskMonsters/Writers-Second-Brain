import * as db from "./db";

/**
 * Seed predefined achievements into the database
 * Run this once to populate the achievements table
 */
export async function seedAchievements() {
  const achievementsData = [
    // Word Count Achievements
    {
      name: "First Words",
      description: "Write your first 100 words",
      category: "word_count" as const,
      threshold: 100,
      icon: "pen",
      color: "#8b5cf6",
    },
    {
      name: "Getting Started",
      description: "Write 1,000 words",
      category: "word_count" as const,
      threshold: 1000,
      icon: "book-open",
      color: "#8b5cf6",
    },
    {
      name: "Momentum Builder",
      description: "Write 5,000 words",
      category: "word_count" as const,
      threshold: 5000,
      icon: "zap",
      color: "#a855f7",
    },
    {
      name: "Novella Master",
      description: "Write 20,000 words",
      category: "word_count" as const,
      threshold: 20000,
      icon: "book",
      color: "#c084fc",
    },
    {
      name: "Novel Writer",
      description: "Write 50,000 words",
      category: "word_count" as const,
      threshold: 50000,
      icon: "trophy",
      color: "#d946ef",
    },
    {
      name: "Epic Storyteller",
      description: "Write 100,000 words",
      category: "word_count" as const,
      threshold: 100000,
      icon: "crown",
      color: "#e879f9",
    },
    
    // Chapter Achievements
    {
      name: "Chapter One",
      description: "Complete your first chapter",
      category: "chapters" as const,
      threshold: 1,
      icon: "file-text",
      color: "#8b5cf6",
    },
    {
      name: "Building Blocks",
      description: "Complete 5 chapters",
      category: "chapters" as const,
      threshold: 5,
      icon: "layers",
      color: "#a855f7",
    },
    {
      name: "Story Arc",
      description: "Complete 10 chapters",
      category: "chapters" as const,
      threshold: 10,
      icon: "book-open",
      color: "#c084fc",
    },
    {
      name: "Novel Complete",
      description: "Complete 20 chapters",
      category: "chapters" as const,
      threshold: 20,
      icon: "check-circle",
      color: "#d946ef",
    },
    
    // Ticket/Task Achievements
    {
      name: "Task Tackler",
      description: "Complete 5 writing tasks",
      category: "tickets" as const,
      threshold: 5,
      icon: "check-square",
      color: "#8b5cf6",
    },
    {
      name: "Productivity Pro",
      description: "Complete 25 writing tasks",
      category: "tickets" as const,
      threshold: 25,
      icon: "target",
      color: "#a855f7",
    },
    {
      name: "Workflow Master",
      description: "Complete 50 writing tasks",
      category: "tickets" as const,
      threshold: 50,
      icon: "award",
      color: "#c084fc",
    },
    {
      name: "Task Champion",
      description: "Complete 100 writing tasks",
      category: "tickets" as const,
      threshold: 100,
      icon: "star",
      color: "#d946ef",
    },
    
    // Streak Achievements
    {
      name: "Consistent Writer",
      description: "Write for 3 days in a row",
      category: "streak" as const,
      threshold: 3,
      icon: "flame",
      color: "#f97316",
    },
    {
      name: "Week Warrior",
      description: "Write for 7 days in a row",
      category: "streak" as const,
      threshold: 7,
      icon: "fire",
      color: "#ea580c",
    },
    {
      name: "Dedication Master",
      description: "Write for 14 days in a row",
      category: "streak" as const,
      threshold: 14,
      icon: "flame",
      color: "#dc2626",
    },
    {
      name: "Unstoppable",
      description: "Write for 30 days in a row",
      category: "streak" as const,
      threshold: 30,
      icon: "zap",
      color: "#b91c1c",
    },
    
    // Novel Kit Achievements
    {
      name: "World Builder",
      description: "Create 5 Novel Kit items",
      category: "novel_kit" as const,
      threshold: 5,
      icon: "globe",
      color: "#06b6d4",
    },
    {
      name: "Character Creator",
      description: "Create 10 characters",
      category: "novel_kit" as const,
      threshold: 10,
      icon: "users",
      color: "#0891b2",
    },
    {
      name: "Universe Architect",
      description: "Create 25 Novel Kit items",
      category: "novel_kit" as const,
      threshold: 25,
      icon: "sparkles",
      color: "#0e7490",
    },
    
    // Special Achievements
    {
      name: "First Project",
      description: "Create your first novel project",
      category: "special" as const,
      threshold: 1,
      icon: "rocket",
      color: "#10b981",
    },
    {
      name: "Organized Writer",
      description: "Use all 8 default workflow columns",
      category: "special" as const,
      threshold: 8,
      icon: "layout",
      color: "#059669",
    },
  ];

  console.log("Seeding achievements...");
  
  for (const achievement of achievementsData) {
    try {
      await db.createAchievement(achievement);
      console.log(`✓ Created achievement: ${achievement.name}`);
    } catch (error) {
      console.error(`✗ Failed to create achievement: ${achievement.name}`, error);
    }
  }
  
  console.log("Achievement seeding complete!");
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAchievements()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
