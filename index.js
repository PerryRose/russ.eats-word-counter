import { createWriteStream, existsSync, writeFile, createReadStream, readdirSync, readFileSync } from 'fs'
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import OpenAI from 'openai';
import path from 'path';

const apifyUrl = process.env['APIFY_URL'];
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});
const OUTPUT_AUDIO_DIR = './src/assets/audio';
const OUTPUT_VIDEO_DIR = './src/assets/video';
const OUTPUT_TRANSCRIPT_DIR = './src/assets/transcripts';

(async () => {
  const tikTokData = await getTikTokData(apifyUrl);
  const tikTokPosts = formatTikTokData(tikTokData);
  await downloadAllVideos(tikTokPosts);
  await extractAllAudio(tikTokPosts);
  await generateTranscripts(tikTokPosts);
  tallyAllWords();
})();

async function getTikTokData(url) {
  const res = await axios.get(url).catch((err) => {
    throw new Error('There was an error Tobtaining TikTok data');
  });

  if (!res || !res.data || !res.data.length) {
    throw new Error('Unable to retrieve TikTok data.');
  }

  let data = res.data;
  data = data.filter((post) => post.id !== '7316009208644701448');

  return data;
}

function formatTikTokData(data) {
  return data.map((post) => {
    return {
      id: post.id,
      audioUrl: post.musicMeta.playUrl,
      audioFilePath: getPathForAudio(post.id),
      videoUrl: post.videoMeta.downloadAddr,
      videoFilePath: getPathForVideo(post.id),
      transcriptFilePath: getPathForTranscript(post.id),
    }
  });
}

async function downloadAllVideos(posts) {
  for await (const post of posts) {
    if (!existsSync(post.videoFilePath)) {
      console.log(`Video ${post.id} doesn't exist`);
      await downloadPost(post.videoUrl, post.videoFilePath);
    } else {
      console.log(`Video ${post.id} exists`);
    }
  }
}

async function downloadPost(url, filePath) {
  const writer = createWriteStream(filePath);

  return axios({
    method: 'get',
    url: url,
    responseType: 'stream',
  }).then(response => {
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          console.log('Downloaded ', filePath);
          resolve(true);
        }
      });
    });
  }).catch((err) => {
    console.log(err.response.status)
    throw new Error('An error has occurred');
  });
}

async function extractAllAudio(posts) {
  for await (const post of posts) {
    if (!existsSync(post.audioFilePath)) {
      console.log(`Video ${post.id} has not had its audio extracted`)
      await extractAudio(post.videoFilePath, post.audioFilePath);

    } else {
      console.log(`Video ${post.id} has already had its audio extracted`)
    }
  }
}

async function extractAudio (inputPath, outputPath) {
  ffmpeg(inputPath)
    .output(outputPath)
    .on('end', () => {
      console.log('Audio extraction complete');
    })
    .on('error', (err) => {
      console.log('An error occurred extracting audio');
      console.log(err)
    })
    .run();
}

async function generateTranscripts(posts) {
  for await (const post of posts) {
    if (!existsSync(post.transcriptFilePath)) {
      console.log(`Transcript for ${post.id} has not been created`)
      await generateTranscript(post.id, post.audioFilePath, post.transcriptFilePath);
    } else {
      console.log(`Transcript for ${post.id} has been created`);
    }
  }
}

async function generateTranscript (postId, audioFilePath, transcriptFilePath) {
  const absolutePath = path.resolve(audioFilePath);
  const transcription = await openai.audio.transcriptions.create({
    file: createReadStream(absolutePath),
    model: "whisper-1",
  });

  writeFile(transcriptFilePath, transcription.text, (err) => {
    if (err) throw err;
    console.log(`Transcript for ${postId} has successfully been saved`);
  });
}

function tallyAllWords() {
  let tally = new Map();
  const files = readdirSync(OUTPUT_TRANSCRIPT_DIR);

  for await (const file of files) {  
    const transcript = readFileSync(`${OUTPUT_TRANSCRIPT_DIR}/${file}`, 'utf8');
    const words = transcript.split(' ').map((word) => word.toLowerCase());
    for (const word of words) {
      const cleanedWord = cleanWord(word);
      const wordCount = tally.get(cleanedWord);
      if (wordCount) {
        tally.set(cleanedWord, wordCount + 1)
      } else {
        tally.set(cleanedWord, 1);
      }
    }
  }

  const tallySorted = new Map([...tally.entries()].sort((a, b) => b[1] - a[1]));
  const tallySortedArray = Array.from(tallySorted, ([name, value]) => ({ name, value }));
  console.log(tallySortedArray);

  var file = createWriteStream(`${OUTPUT_TRANSCRIPT_DIR}/completeTally.txt`);
  file.on('error', function(err) { console.log('An error has occurred') });
  tallySortedArray.forEach(function(v) { file.write(`${v.name}\t${v.value}\n`); });
  file.end();
}

function cleanWord(word) {
  let cleanedWord = word;
  if (cleanedWord === "fuckin'" || cleanedWord === 'fuckin') {
    cleanedWord = 'fucking';
  }
  cleanedWord = cleanedWord.replace(/[.,-?\s]/g, '');
  return cleanedWord;
}

function getPathForAudio(fileName) {
  return `${OUTPUT_AUDIO_DIR}/${fileName}.mp3`;
}

function getPathForVideo(fileName) {
  return `${OUTPUT_VIDEO_DIR}/${fileName}.mp4`;
}

function getPathForTranscript(fileName) {
  return `${OUTPUT_TRANSCRIPT_DIR}/${fileName}.txt`;
}
