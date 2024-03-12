import { createWriteStream, readFileSync, readdirSync } from 'fs';
import { cleanWord } from '../utils/TranscriptUtils';

class TranscriptAnalytics {
  static async tallyAllWords(transcriptDir: string, analyticsDir: string) {
    let tally = new Map();
    const files = readdirSync(transcriptDir);

    for await (const file of files) {
      const transcript = readFileSync(`${transcriptDir}/${file}`, 'utf8');
      const words = transcript.split(' ').map((word) => word.toLowerCase());
      for (const word of words) {
        const cleanedWord = cleanWord(word);
        const wordCount = tally.get(cleanedWord);
        if (wordCount) {
          tally.set(cleanedWord, wordCount + 1);
        } else {
          tally.set(cleanedWord, 1);
        }
      }
    }

    const tallySorted = new Map([...tally.entries()].sort((a, b) => b[1] - a[1]));
    const tallySortedArray = Array.from(tallySorted, ([name, value]) => ({ name, value }));
    console.log(tallySortedArray);

    var file = createWriteStream(`${analyticsDir}/completeTally.txt`);
    file.on('error', function (err) {
      console.log('An error has occurred');
    });

    const dateString = new Date().toDateString();
    file.write(`[Russ.Eats Word Counter] - Made by Perry Rose\nLast updated: ${dateString}\nVideo Count: ${files.length}\n\n`);

    tallySortedArray.forEach(function (v) {
      file.write(`${v.name}\t${v.value}\n`);
    });
    file.end();
  }
}

export default TranscriptAnalytics;
