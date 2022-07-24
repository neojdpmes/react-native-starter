import { PhotoIdentifier } from '@react-native-community/cameraroll';
import React, { useEffect, useState } from 'react';
import { CachesDirectoryPath, copyAssetsFileIOS, copyAssetsVideoIOS, unlink, writeFile, read } from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob'

const MAX_SIZE = 1024 * 1024 * 250 // 300 MB
const MAX_BUFFER = 1024 * 200 * 50

export default function useUpload(URL = 'http://192.168.1.18:18091') {
  const [ uploaded, setUploaded ] = useState<PhotoIdentifier>();

  const uploadFile = async (photo: PhotoIdentifier) => {
    const { uri, width, height } = photo.node.image;
    let newFile: string;
    const cacheDir = CachesDirectoryPath + '/temp';
    try {
      await unlink(cacheDir);
    } catch(err) {
      console.log('Nothing to unlink');
    }
    if (photo.node.type === 'video') {
      newFile = await copyAssetsVideoIOS(uri, cacheDir);
    } else {
      newFile = await copyAssetsFileIOS(uri, cacheDir, width, height);
    }

    const totalParts = Math.ceil((photo.node.image.fileSize || 0) / MAX_BUFFER);

    if ((photo.node.image.fileSize || 0) > MAX_SIZE) {
      let part = 0;
      while (part < totalParts) {
        const file = await read(newFile, MAX_BUFFER, part * MAX_BUFFER, { encoding: 'base64' });
        const res = await RNFetchBlob.fetch('POST', URL + '/parts', {
          'Params': JSON.stringify({
            name: photo.node.image.filename,
            album: photo.node.group_name,
          }),
          'Content-Type' : 'octet-stream'
        }, file);
        part++;
      }
    } else {
      await RNFetchBlob.fetch('POST', URL, {
        'Params': JSON.stringify({
          name: photo.node.image.filename,
          album: photo.node.group_name,
        }),
        'Content-Type' : 'application/octet-stream',
      }, RNFetchBlob.wrap(newFile))
    }
    setUploaded(photo);
  }
  return { uploaded, uploadFile };
}