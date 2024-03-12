import axios from 'axios';
import { IFormattedTikTokVideo } from '../types/TikTok';
import { createWriteStream, existsSync } from 'fs';
import { deleteFile, fileIsNotEmpty, getFilePath } from './utils/FileUtils';
import ffmpeg from 'fluent-ffmpeg';

export class MediaProcessor {
  private outputPath: string;
  constructor(outputPath: string) {
    this.outputPath = outputPath;
  }

  async downloadAllVideos(posts: IFormattedTikTokVideo[]) {
    for (const post of posts) {
      const videoFilePath = getFilePath(this.outputPath, post.id, 'video');
      if (!existsSync(videoFilePath)) {
        console.log(`Video ${post.id} doesn't exist`);
        await this.downloadPost(post.videoUrl, videoFilePath);
      } else {
        console.log(`Video ${post.id} exists`);
      }
    }
  }

  private async downloadPost(url: string, filePath: string) {
    const writer = createWriteStream(filePath);

    console.log(url);

    return axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    })
      .then((response) => {
        return new Promise<void>((resolve, reject) => {
          response.data.pipe(writer);
          let error: Error | null = null;
          writer.on('error', (err) => {
            error = err;
            writer.close();
            reject(err);
          });
          writer.on('close', () => {
            console.log('Closing');
            console.log('Error:', error);
            console.log('FileIsNotEmpty:', fileIsNotEmpty(filePath));
            if (!error && fileIsNotEmpty(filePath)) {
              console.log('Downloaded ', filePath);
              resolve();
            } else {
              // Delete file
              console.log('Must delete file');
              deleteFile(filePath);
            }
          });
        });
      })
      .catch((err) => {
        console.log(err.response.status);
        console.log('Must delete file');
        deleteFile(filePath);
      });
  }

  async extractAllAudio(posts: IFormattedTikTokVideo[]) {
    for (const post of posts) {
      const videoFilePath = getFilePath(this.outputPath, post.id, 'video');
      const audioFilePath = getFilePath(this.outputPath, post.id, 'audio');
      if (!existsSync(audioFilePath)) {
        console.log(`Video ${post.id} has not had its audio extracted`);
        await this.extractAudio(videoFilePath, audioFilePath);
      } else {
        console.log(`Video ${post.id} has already had its audio extracted`);
      }
    }
  }

  private async extractAudio(inputPath: string, outputPath: string) {
    return new Promise<void>((resolve, _) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .on('end', () => {
          console.log('Audio extraction complete');
          resolve();
        })
        .on('error', (err) => {
          console.log('An error occurred extracting audio');
          console.log(err);
          resolve();
        })
        .run();
    });
  }
}
