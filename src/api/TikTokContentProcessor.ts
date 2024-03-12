import axios from 'axios';
import { IFormattedTikTokVideo, ITikTokVideo } from '../types/TikTok';

export class TikTokContentProcessor {
  private apiUrl;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getTikTokData() {
    try {
      const res = await axios.get(this.apiUrl);
      if (!res || !res.data || !res.data.length) {
        throw new Error('Unable to retrieve TikTok data.');
      }
      return res.data.filter((post: ITikTokVideo) => post.id !== '7316009208644701448');
    } catch (err) {
      throw new Error('There was an error obtaining TikTok data');
    }
  }

  formatTikTokData(data: ITikTokVideo[]): IFormattedTikTokVideo[] {
    return data.map((post: ITikTokVideo) => {
      return {
        id: post.id,
        audioUrl: post.musicMeta.playUrl,
        videoUrl: post.videoMeta.downloadAddr
      };
    });
  }
}
