import { PhotoIdentifier } from '@react-native-community/cameraroll';
import React, { useState, useEffect } from 'react';

export default function useUpload(URL = 'http://192.168.1.18:18091') {
  const uploadFile = async (photo: PhotoIdentifier) => {
    const data = new FormData();
    data.append('file', {
      name: photo.node.image.filename,
      uri: photo.node.image.uri,
    });
    data.append('album', photo.node.group_name);
    data.append('type', photo.node.type);
    return fetch(URL, {
      method: "post",
      body: data,
      headers: {
        "Content-Type": "multipart/form-data; ",
      },
    });
  }
  return { uploadFile };
}