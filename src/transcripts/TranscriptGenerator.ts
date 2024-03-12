import OpenAI from 'openai';
import { IFormattedTikTokVideo } from '../types/TikTok';
import { createReadStream, existsSync, writeFile } from 'fs';
import path from 'path';
import { getFilePath } from '../media/utils/FileUtils';

export class TranscriptGenerator {
  private openai;
  private model: string;
  private outputPath: string;
  constructor(apiKey: string, model: string, outputPath: string) {
    this.model = model;
    this.outputPath = outputPath;
    this.openai = new OpenAI({
      apiKey
    });
  }

  async generateTranscripts(posts: IFormattedTikTokVideo[]) {
    for (const post of posts) {
      const audioFilePath = getFilePath(this.outputPath, post.id, 'audio');
      const transcriptFilePath = getFilePath(this.outputPath, post.id, 'video');
      if (!existsSync(transcriptFilePath)) {
        console.log(`Transcript for ${post.id} has not been created`);
        await this.generateTranscript(post.id, audioFilePath, transcriptFilePath);
      } else {
        console.log(`Transcript for ${post.id} has been created`);
      }
    }
  }

  private async generateTranscript(postId: string, audioFilePath: string, transcriptFilePath: string) {
    const absolutePath = path.resolve(audioFilePath);
    const transcription = await this.openai.audio.transcriptions.create({
      file: createReadStream(absolutePath),
      model: this.model
    });

    writeFile(transcriptFilePath, transcription.text, (err) => {
      if (err) {
        console.log(err);
      }
      console.log(`Transcript for ${postId} has successfully been saved`);
    });
  }
}
