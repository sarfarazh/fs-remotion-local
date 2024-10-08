import { getInputProps } from 'remotion';
import AWS from 'aws-sdk';

interface InputProps extends Record<string, unknown> {
  bucketName: string;
  seriesId: string;
  jobId: string;
}

export const getAssets = () => {
  const { bucketName, seriesId, jobId } = getInputProps<InputProps>();
  const s3 = new AWS.S3();

  const getFile = async (key: string) => {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: bucketName,
      Key: `${seriesId}/${jobId}/${key}`,
    };
    const data = await s3.getObject(params).promise();
    return data.Body?.toString('utf-8') || '';
  };

  return {
    getTranscription: () => getFile('transcription.json'),
    getVideoSettings: () => getFile('video_settings.json'),
    getAudioUrl: () => `https://${bucketName}.s3.amazonaws.com/${seriesId}/${jobId}/summary.mp3`,
    getSlides: async () => {
      const params: AWS.S3.ListObjectsV2Request = {
        Bucket: bucketName,
        Prefix: `${seriesId}/${jobId}/`,
      };
      const data = await s3.listObjectsV2(params).promise();
      return data.Contents
        ?.filter((object: AWS.S3.Object) => object.Key?.endsWith('.jpg') || object.Key?.endsWith('.png'))
        .map((object: AWS.S3.Object) => `https://${bucketName}.s3.amazonaws.com/${object.Key}`) || [];
    },
  };
};