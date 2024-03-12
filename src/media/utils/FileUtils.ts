import { statSync } from 'fs';
import { rm } from 'fs/promises';

export type MediaType = 'audio' | 'video' | 'transcript';

export const getFilePath = (outputPath: string, postId: string, mediaType: MediaType) => {
  if (mediaType === 'audio') {
    return `${outputPath}/audio/${postId}.mp3`;
  } else if (mediaType === 'video') {
    return `${outputPath}/video/${postId}.mp4`;
  } else if (mediaType === 'transcript') {
    return `${outputPath}/transcript/${postId}.txt`;
  }
  throw new Error('Invalid media type');
};

export const fileIsNotEmpty = (path: string) => {
  console.log('Checking if file empty');
  const stats = statSync(path);
  const fileSizeInBytes = stats.size;
  console.log('Is file empty:', fileSizeInBytes != 0);
  return fileSizeInBytes != 0;
};

export const deleteFile = async (path: string) => {
  await rm(path)
    .then(() => {
      console.log('Successfully removed file.');
    })
    .catch((err) => {
      console.log('An error occurred removing file');
      console.log(err);
    });
};
