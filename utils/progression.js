/**
 * Calcola il prossimo target in base al range e al carico.
 * cycleLength = quanti giorni deve attendere prima di ritornare allo stesso esercizio
 */
export function getNextTarget ({
  currentReps,
  minReps,
  maxReps,
  load,
  stepLoad
}) {
  if (currentReps >= maxReps) {
    return { reps: minReps, load: load + stepLoad };
  }
  return { reps: currentReps + 1, load };
}
