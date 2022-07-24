import { PhotoIdentifier } from '@react-native-community/cameraroll';
import React from 'react';
import { CachesDirectoryPath, copyAssetsFileIOS, copyAssetsVideoIOS, unlink } from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob'

export default function useUpload(URL = 'http://192.168.1.18:18091') {
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
    return RNFetchBlob.fetch('POST', URL, {
      'Params': JSON.stringify({
        name: photo.node.image.filename,
        album: photo.node.group_name,
      }),
      'Content-Type' : 'application/octet-stream',
    }, RNFetchBlob.wrap(newFile))
  }
  return { uploadFile };
}