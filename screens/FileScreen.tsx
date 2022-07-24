/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useMemo, useState} from 'react';
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

import { getPhotos, PhotoIdentifier } from "@react-native-community/cameraroll";
import { FlatList } from 'react-native-gesture-handler';
import useSocket from '../hooks/useSocket';
import useUpload from '../hooks/useUpload';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';

const PHOTOS_PER_LOAD = 250;

const FileScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [albums, setAlbums] = useState([] as PhotoIdentifier[]);
  const [ count, setCount ] = useState(0);
  const [ uploaded, setUploaded ] = useState<PhotoIdentifier>();
  const [ uploading, setUploading ] = useState(false);
  const { isConnected } = useSocket();
  const { uploadFile } = useUpload();
  useKeepAwake();

  useEffect(() => {
    if (!albums.length) getImages();
  }, [])

  useEffect(() => {
    if (uploaded) {
      setCount(count + 1);
    }
  }, [uploaded])

  const getImages = async () => {
    console.log('Loading albums / videos');
    const albums: PhotoIdentifier[] = [];
    const initialData = await getPhotos({ first: PHOTOS_PER_LOAD, assetType: 'All' })
    console.log(initialData.edges[0])
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

  const uploadPhotos = async () => {
    for (let i = 0; i < albums.length; i++ ) {
      const res = await uploadFile(albums[i]);
      setUploaded(albums[i]);
      console.log(res.text());
    }
  }

  const ImageList = useMemo(() => { 
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Button title="Upload all" disabled={!isConnected} onPress={() => {setUploading(true); uploadPhotos()}}></Button>
      <View style={styles.container}>
        { !!albums.length && uploading && <>
          <Text style={styles.text}>Uploading {count} of {albums.length}</Text>
        </>}
        { !!albums.length && uploading && !!uploaded && <>
          <Image style={styles.uploadedItem} source={{ uri: uploaded.node.image.uri }}/>
          <Text style={styles.text}>{uploaded.node.image.filename}</Text>
        </>}
        { !albums.length 
          ? <Text style={styles.text}>Loading images</Text>
          : <>{ ImageList }</>
        }
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  photoContainer: {
    margin: 16,
  },
  button: {
    textAlign: 'center',
    fontSize: 24
  },
  text: {
    textAlign: 'center',
    fontSize: 18
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
  uploadedItem: {
    height: 100,
    width: 150,
    alignSelf: 'center',
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
