import { TikTokContentProcessor } from './src/api/TikTokContentProcessor';
import { MediaProcessor } from './src/media/MediaProcessor';
import { TranscriptGenerator } from './src/transcripts/TranscriptGenerator';
import TranscriptAnalytics from './src/transcripts/analytics/TranscriptAnalytics';
import { getTranscriptDir } from './src/transcripts/utils/TranscriptUtils';
import { getAnalyticsDir } from './src/transcripts/utils/AnalyticsUtil';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const apifyUrl = process.env['APIFY_URL']!;
  const apiKey = process.env['OPENAI_API_KEY']!;
  const model = 'whisper-1';
  const outputPath = './src/assets';

  const tikTokContentProcessor = new TikTokContentProcessor(apifyUrl);
  const mediaProcessor = new MediaProcessor(outputPath);
  const transcriptGenerator = new TranscriptGenerator(apiKey, model, outputPath);

  const tikTokData = await tikTokContentProcessor.getTikTokData();
  const tikTokPosts = tikTokContentProcessor.formatTikTokData(tikTokData);

  await mediaProcessor.downloadAllVideos(tikTokPosts);
  await mediaProcessor.extractAllAudio(tikTokPosts);

  await transcriptGenerator.generateTranscripts(tikTokPosts);

  const transcriptDir = getTranscriptDir(outputPath);
  const analyticsDir = getAnalyticsDir(outputPath);
  await TranscriptAnalytics.tallyAllWords(transcriptDir, analyticsDir);
})();
