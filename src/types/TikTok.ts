interface IAuthorMeta {
  id: string;
  name: string;
  nickName: string;
  verified: boolean;
  signature: string;
  bioLink: string;
  avatar: string;
  commerceUserInfo: {
    commerceUser: boolean;
  };
  privateAccount: boolean;
  ttSeller: false;
  following: number;
  friends: number;
  fans: number;
  heart: number;
  video: number;
  digg: number;
}

interface IMusicMeta {
  musicName: string;
  musicAuthor: string;
  musicOriginal: boolean;
  playUrl: string;
  coverMediumUrl: string;
  musicId: string;
}

interface IVideoMeta {
  height: number;
  width: number;
  duration: number;
  coverUrl: string;
  originalCoverUrl: string;
  definition: string;
  format: string;
  originalDownloadAddr: string;
  downloadAddr: string;
}

interface IHashTag {
  name: string;
}

export interface ITikTokVideo {
  id: string;
  text: string;
  createTime: number;
  createTimeISO: string;
  authorMeta: IAuthorMeta;
  musicMeta: IMusicMeta;
  webVideoUrl: string;
  mediaUrls: string[];
  videoMeta: IVideoMeta;
  diggCount: number;
  shareCount: number;
  playCount: number;
  collectCount: number;
  commentCount: number;
  mentions: any[]; // TODO: Define
  hashtags: IHashTag[];
  isSlideshow: boolean;
  isPinned: boolean;
}

export interface IFormattedTikTokVideo {
  id: string;
  audioUrl: string;
  // audioFilePath: string;
  videoUrl: string;
  // videoFilePath: string;
  // transcriptFilePath: string;
}
