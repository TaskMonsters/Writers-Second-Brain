export const interviewQuestions = {
  basics: [
    "What's your full name? Do you have any nicknames?",
    "How old are you?",
    "Where were you born?",
    "What do you do for a living?",
    "What's your educational background?",
    "Describe your physical appearance.",
    "What's your most distinctive feature?"
  ],
  personality: [
    "How would you describe yourself in three words?",
    "What's your greatest strength?",
    "What's your biggest weakness?",
    "What makes you angry?",
    "What makes you happy?",
    "How do you handle stress?",
    "Are you an introvert or extrovert?",
    "What's your sense of humor like?"
  ],
  background: [
    "Tell me about your childhood.",
    "What's your relationship with your parents?",
    "Do you have siblings? What's your relationship with them?",
    "What's your happiest memory?",
    "What's your most painful memory?",
    "What was the biggest turning point in your life?",
    "What regrets do you have?"
  ],
  relationships: [
    "Who is the most important person in your life right now?",
    "Do you have a best friend? What are they like?",
    "Have you ever been in love?",
    "Who do you trust the most?",
    "Who do you trust the least?",
    "Is there anyone you would die for?",
    "Is there anyone you hate?",
    "How do you show affection to people you care about?"
  ],
  beliefs: [
    "What do you believe in?",
    "What is your philosophy of life?",
    "What are your political views?",
    "Are you religious or spiritual?",
    "What would you stand up and fight for?",
    "What do you think happens after death?",
    "What is the most important value to you?"
  ],
  daily_life: [
    "What does a typical day look like for you?",
    "What time do you wake up? Are you a morning person?",
    "What's in your fridge right now?",
    "What's in your pockets or bag?",
    "What does your living space look like?",
    "What do you do for fun?",
    "What's your favorite meal?",
    "What music do you listen to?",
    "What do you read?",
    "How do you dress? What's your style?"
  ],
  goals: [
    "What do you want more than anything?",
    "What are your goals for the future?",
    "What's stopping you from achieving your dreams?",
    "If you could change one thing about your life, what would it be?",
    "Where do you see yourself in five years?",
    "What would you do if you knew you couldn't fail?"
  ],
  secrets: [
    "What's your biggest secret?",
    "What are you ashamed of?",
    "What do you hide from others?",
    "What would people be surprised to learn about you?",
    "What's the worst thing you've ever done?",
    "What's your guilty pleasure?"
  ],
  voice: [
    "Do you have any catchphrases or words you use a lot?",
    "How would you describe the way you speak?",
    "Do you have an accent?",
    "Are you more formal or casual in conversation?",
    "Do you curse? When?",
    "How do you greet people?",
    "How do you say goodbye?"
  ]
};

export const interviewCategories = {
  basics: "Basics",
  personality: "Personality",
  background: "Background",
  relationships: "Relationships",
  beliefs: "Beliefs",
  daily_life: "Daily Life",
  goals: "Goals & Dreams",
  secrets: "Secrets",
  voice: "Voice & Speech"
};

export type InterviewCategory = keyof typeof interviewQuestions;
export type InterviewAnswers = Partial<Record<InterviewCategory, Record<number, string>>>;
