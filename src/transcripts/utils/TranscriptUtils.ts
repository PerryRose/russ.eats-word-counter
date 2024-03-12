export const cleanWord = (word: string) => {
  let cleanedWord = word;
  if (cleanedWord === "fuckin'" || cleanedWord === 'fuckin') {
    cleanedWord = 'fucking';
  }
  cleanedWord = cleanedWord.replace(/[\s\W]+$/g, '');
  return cleanedWord;
};

export const getTranscriptDir = (outputPath: string) => {
  return `${outputPath}/transcript`;
};
