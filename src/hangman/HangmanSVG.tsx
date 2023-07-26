import React from "react";

interface HangmanSVGProps {
  guesses: number;
}

const HangmanSVG: React.FC<HangmanSVGProps> = ({ guesses }) => {
  // Function to determine which parts of the hangman to show based on the number of guesses
  const getHangmanParts = (guesses: number): JSX.Element[] => {
    const maxGuesses = 6; // Assuming 6 incorrect guesses before game over

    // SVG components for different parts of the hangman
    const hangmanParts: JSX.Element[] = [
      <circle key="head" cx="150" cy="50" r="20" fill="white" />,
      <line key="body" x1="150" y1="70" x2="150" y2="120" />,
      <line key="leftArm" x1="150" y1="80" x2="130" y2="100" />,
      <line key="rightArm" x1="150" y1="80" x2="170" y2="100" />,
      <line key="leftLeg" x1="150" y1="120" x2="130" y2="150" />,
      <line key="rightLeg" x1="150" y1="120" x2="170" y2="150" />,
    ];

    const visibleParts = hangmanParts.slice(0, guesses);

    // If the game is over (more than or equal to maxGuesses), show the entire hangman
    return guesses >= maxGuesses ? hangmanParts : visibleParts;
  };

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      stroke="black"
      strokeWidth={2}
    >
      {/* Hangman scaffold */}
      <line x1="20" y1="180" x2="100" y2="180" />
      <line x1="60" y1="20" x2="60" y2="180" />
      <line x1="60" y1="20" x2="150" y2="20" />
      <line x1="150" y1="20" x2="150" y2="50" />

      {/* Hangman parts */}
      {getHangmanParts(guesses)}
    </svg>
  );
};

export default HangmanSVG;
