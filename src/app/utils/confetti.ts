import confetti from 'canvas-confetti';

export const handleConfetti = (ref: HTMLButtonElement) => {
  if (!ref) return;

  const rect = ref.getBoundingClientRect();

  confetti({
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
  });
};
