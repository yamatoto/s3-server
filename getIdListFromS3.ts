import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SdkStream } from '@aws-sdk/types';
import { Readable } from 'stream';
import AWS from 'aws-sdk';

const ssm = new AWS.SSM({ region: 'ap-northeast-1' });
const s3Client = new S3Client({ region: 'ap-northeast-1' });
const request = {
    Name: 'BUCKET_NAME_ID_LIST',
    WithDecryption: true,
};

const streamToList = (stream: SdkStream<Readable>): Promise<string[]> =>
    new Promise((resolve, reject) => {
        const items: string[] = [];
        const splitter = /[\r\n]+/;
        let leftOver = '';

        const toItems = (data: string[]): string[] => data.filter((line) => line.trim()).map((id) => id);

        stream.on('data', (chunk: Uint8Array) => {
            const data = `${leftOver}${chunk.toString()}`.split(splitter);
            leftOver = data.pop() || '';
            items.push(...toItems(data));
        });
        stream.on('error', reject);
        stream.on('end', () => resolve(items.concat(leftOver ? toItems(leftOver.split(splitter)) : [])));
    });

export async function getIdListFromS3(): Promise<string[]> {
    try {
        const { Parameter } = await ssm.getParameter(request).promise();
        const { Body } = await s3Client.send(
            new GetObjectCommand({
                Bucket: Parameter?.Value,
                Key: 'idList.csv',
            })
        );
        return await streamToList(Body as SdkStream<Readable>);
    } catch (e) {
        console.error(`List取得でエラー発生:${(e as Error).message}`, e);
        return [];
    }
}
