import { GuessedWord } from "./types";

export function GuessDashes(props: { guessedWord: GuessedWord }) {
  const { guessedWord } = props;
  return (
    <>
      {guessedWord.word.split(" ").map((wordPart, index) => (
        <span key={index}>
          {wordPart.split("").map((letter, letterIndex) => (
            <span key={letterIndex} style={{ marginRight: "10px" }}>
              {guessedWord.guessedLetters.includes(letter) ? letter : "_"}
            </span>
          ))}
          {index < guessedWord.word.split(" ").length - 1 && " "}
        </span>
      ))}
    </>
  );
}
