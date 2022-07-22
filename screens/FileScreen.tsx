/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useCallback, useEffect, useMemo, useState, type PropsWithChildren} from 'react';
import { readDirAssets, MainBundlePath, readFileAssets, readDir, LibraryDirectoryPath, DocumentDirectoryPath, DownloadDirectoryPath, CachesDirectoryPath } from 'react-native-fs';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Text,
  View,
  Button,
} from 'react-native';

import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';
import { getAlbums, getPhotos, PhotoIdentifier } from "@react-native-community/cameraroll";
import { FlatList } from 'react-native-gesture-handler';
import useSocket from '../hooks/useSocket';
import useUpload from '../hooks/useUpload';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';

const PHOTOS_PER_LOAD = 250;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_REQUESTS = 1; // 10MB

const FileScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [albums, setAlbums] = useState([] as PhotoIdentifier[]);
  const [ count, setCount ] = useState(0);
  const [ uploadCount, setUploadCount ] = useState(0);
  const [ uploadQueue, setUploadQueue ] = useState([] as PhotoIdentifier[]);
  const [ fetchResponse, setFetchResponse ] = useState({} as Response);
  const { socket, isConnected } = useSocket();
  const { uploadFile } = useUpload();
  useKeepAwake();

  useEffect(() => {
    if (!albums.length) getImages();
  }, [])

  useEffect(() => {
    if (fetchResponse.status === 200) {
      setCount(count + 1);
    }
    if (uploadCount) {
      setUploadCount(uploadCount - 1);
      console.log('Releasing');
    }
}, [fetchResponse])

  useEffect(() => {
    if (uploadQueue.length && uploadCount < MAX_REQUESTS) {
      const photo = uploadQueue.pop();
      setUploadQueue([...uploadQueue]);
      if (photo) {
        uploadPhoto(photo);
        setUploadCount(uploadCount + 1);
      }
    }
  }, [uploadCount, uploadQueue]);

  const getImages = async () => {
    console.log('Loading albums');
    const albums: PhotoIdentifier[] = [];
    const initialData = await getPhotos({ first: PHOTOS_PER_LOAD, assetType: 'Photos' })
    let next = initialData.page_info.has_next_page;
    let cursor = initialData.page_info.end_cursor;
    albums.push.apply(albums, initialData.edges);
    while (next) {
      const data = await getPhotos({ first: PHOTOS_PER_LOAD, assetType: 'All', after: cursor });
      next = data.page_info.has_next_page;
      cursor = data.page_info.end_cursor;
      albums.push.apply(albums, data.edges);
    }
    setAlbums(albums);
  }

  const uploadPhoto = async (photo: PhotoIdentifier) => {
    try {
      console.log('Uploading', `${photo.node.image.filename} - ${photo.node.image.fileSize}`);  
      const res = await uploadFile(photo);
      setFetchResponse(res);
    } catch (err: any) {
      console.log(err.message);
    }
  }

  const ImageList = useMemo(() => { 
    console.log('rendering')
    return <FlatList
      data={albums}
      numColumns={2}
      contentContainerStyle={styles.photoContainer}
      renderItem={({ item }: any) => <Photo item={item.node}/>}
      keyExtractor={(item, index) => index.toString()}
      />
  }, [albums]);

  const Photo = ({ item }: any) => { 
    return (<>
    <View style={styles.flex}>
      <Image style={styles.item} source={{ uri: item?.image.uri }}/>
    </View>
  </>)};

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Button title="Upload" disabled={!isConnected} onPress={() => setUploadQueue([...albums])}></Button>
      { !!albums.length && <Text>Uploading {count} of {albums.length}</Text>}
      { !albums.length 
        ? <Text>Loading images</Text>
        : <>{ ImageList }</>
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  photoContainer: {
    margin: 16,
  },
  flex: {
    flex: 1,
    alignItems: 'stretch',
  },
  item: {
    height: 100,
    minWidth: 100,
    maxWidth: 1000,
    justifyContent: 'center',
    margin: 8,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default FileScreen;
