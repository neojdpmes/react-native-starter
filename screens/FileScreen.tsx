/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState, type PropsWithChildren} from 'react';
import { readDirAssets, MainBundlePath, readFileAssets, readDir, LibraryDirectoryPath, DocumentDirectoryPath, DownloadDirectoryPath, CachesDirectoryPath } from 'react-native-fs';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Text,
  View,
  VirtualizedList,
} from 'react-native';

import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';
import { getAlbums, getPhotos, PhotoIdentifier } from "@react-native-community/cameraroll";
import { FlatList } from 'react-native-gesture-handler';

const PHOTOS_PER_LOAD = 250;

const FileScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [albums, setAlbums] = useState([] as PhotoIdentifier[]);

  useEffect(() => {
    //checkFiles();
    if (!albums.length) getImages();
  }, [])

  const getImages = async () => {
    console.log('Loading albums');
    const albums: PhotoIdentifier[] = [];
    const initialData = await getPhotos({ first: PHOTOS_PER_LOAD, assetType: 'Photos' })
    let next = initialData.page_info.has_next_page;
    let cursor = initialData.page_info.end_cursor;
    albums.push.apply(albums, initialData.edges);
    while (next) {
      const data = await getPhotos({ first: PHOTOS_PER_LOAD, assetType: 'Photos', after: cursor });
      next = data.page_info.has_next_page;
      cursor = data.page_info.end_cursor;
      console.log(next);
      albums.push.apply(albums, data.edges);
    }
    setAlbums(albums);
  }

  const checkFiles = async (directory = CachesDirectoryPath) => {
    const dir = await readDir(directory);
    for (const file of dir) {
      try {
        if (file.isDirectory()) {
          console.log('Directory', file.name);
          await checkFiles(file.path);
        }
        if (file.isFile()) 
          console.log(file.path);
      } catch(err: any) {
        console.log(err.message);
      }
    }
  }
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const Photo = ({ item }: any) => (<>
    <View style={styles.flex}>
      <Image style={styles.item} source={{ uri: item?.image.uri }}/>
    </View>
  </>);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      { !albums.length 
        ? <Text>Loading images</Text>
        : <FlatList
          data={albums}
          numColumns={2}
          contentContainerStyle={styles.photoContainer}
          renderItem={({ item }: any) => <Photo item={item.node}/>}
          keyExtractor={(item, index) => index.toString()}
          />
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
