export async function getAIResponse(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('football')) {
    return 'Focus on sprint training, ball control drills, and endurance workouts.';
  }

  if (lowerPrompt.includes('badminton')) {
    return 'Practice footwork, shadow drills, and reaction speed exercises.';
  }

  if (lowerPrompt.includes('cricket')) {
    return 'Work on hand-eye coordination and consistent batting practice.';
  }

  return 'Stay consistent with training, maintain fitness, and practice regularly.';
}