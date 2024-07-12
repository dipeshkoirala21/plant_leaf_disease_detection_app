import React, { useState } from 'react';
import {
  SafeAreaView,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  Platform,
  Dimensions,
  useColorScheme,
  View,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { BASE_URL, actions } from './constants';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';




export const { height, width } = Dimensions.get('window');



export const fonts = {
  Bold: { fontFamily: 'Roboto-Bold' },
};


const App: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [label, setLabel] = useState<string>('');
  const isDarkMode = useColorScheme() === 'dark';
  const [image, setImage] = useState<string>('');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const getPrediction = async (params: any) => {
    try {
      const bodyFormData = new FormData();
      bodyFormData.append('file', {
        uri: params.uri,
        name: params.name,
        type: params.type,
      });
      const response = await axios.post(BASE_URL, bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });
      return response;
    } catch (error) {
      setLabel('Failed to predict.');
      throw error;
    }
  };


  const onButtonPress = React.useCallback((type: string, options: ImagePicker.CameraOptions | ImagePicker.ImageLibraryOptions) => {
    if (type === 'capture') {
      ImagePicker.launchCamera(options, async (response: any) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          const uri = response?.assets[0]?.uri;
          const path = Platform.OS !== 'ios' ? uri : 'file://' + uri;
          getResult(path, response);
        }
      });
    } else {
      ImagePicker.launchImageLibrary(options, async (response: any) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          const uri = response.assets[0].uri;
          const path = Platform.OS !== 'ios' ? uri : 'file://' + uri;
          getResult(path, response);
        }
      });

    }
  }, []);

  const clearOutput = () => {
    setResult('');
    setImage('');
  };

  const getResult = async (path: string, response: any) => {
    setImage(path);
    setLabel('Predicting...');
    setResult('');
    const params = {
      uri: path,
      name: response.assets[0].fileName,
      type: response.assets[0].type || 'image/jpeg',
    };
    console.log(params, 'paramssss')
    const res = await getPrediction(params);
    console.log(res, 'resssssss')
    if (res?.data?.class) {
      setLabel(res.data.class);
      setResult(res.data.confidence);
    } else {
      setLabel('Failed to predict');
    }
  };



  return (
    <View style={[backgroundStyle, styles.outer]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ImageBackground
        blurRadius={20}
        source={require("./assets/background.jpg")}
        style={{ height: height, width: width }}

      />
      <Text style={[styles.title, { fontSize: 22 }]}>{'Plant Leaf Disease Detection'}</Text>

      {(image?.length && (
        <>
          <TouchableOpacity onPress={clearOutput} style={[styles.clearStyle,{position:"absolute", zIndex:999, marginTop:74, marginRight:36}]}>
            <Image source={require('./assets/cancel.png')} style={styles.clearImage} />
          </TouchableOpacity>
          <Image source={{ uri: image }} style={styles.imageStyle} />
        </>
      )) ||
        null}
      {(result && label && (
        <View style={styles.mainOuter}>
          <Text style={[styles.space, styles.labelText]}>
            {'Label: \n'}
            <Text style={styles.resultText}>{label}</Text>
          </Text>
          <Text style={[styles.space, styles.labelText]}>
            {'Confidence: \n'}
            <Text style={styles.resultText}>
              {parseFloat(result).toFixed(2) + '%'}
            </Text>
          </Text>
        </View>
      )) ||
        (image && <Text style={styles.emptyText}>{label}</Text>) || (
          <Text style={[styles.emptyText,{fontSize:20, fontWeight:"bold"}]}>
            Take or Select a Photo !
          </Text>
        )}
      <View style={styles.btn}>
        {actions.map(({ title, image_path, type, options }, i) => {
          return (
            <View style={styles.outer} key={i}>
              <TouchableOpacity

                activeOpacity={0.9}
                onPress={() => onButtonPress(type, options)}
                style={[styles.btnStyle, { width: 130, justifyContent: "center", alignItems: "center" }]}>
                <Image source={image_path} style={styles.imageIcon} />

              </TouchableOpacity>
              <Text style={[styles.labelText, { marginTop: 10 }]}>{title}</Text>
            </View>
          );
        })}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    alignSelf: 'center',
    position: 'absolute',
    top: 10,
    fontSize: 30,
    ...fonts.Bold,
    color: '#FFF',
  },
  clearImage: { height: 40, width: 40, tintColor: '#FFF' },
  mainOuter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: height / 1.6,
    alignSelf: 'center',
  },
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    position: 'absolute',
    bottom: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  btnStyle: {
    backgroundColor: '#FFF',
    opacity: 0.8,
    marginHorizontal: 30,
    padding: 20,
    borderRadius: 20,
  },
  imageStyle: {
    marginBottom: 50,
    width: width / 1.5,
    height: width / 1.5,
    borderRadius: 20,
    position: 'absolute',
    borderWidth: 0.3,
    borderColor: '#FFF',
    top: height / 4.5,
  },
  clearStyle: {
    position: 'absolute',
    top: 100,
    right: 30,
    tintColor: '#FFF',
    zIndex: 10,
  },
  space: { marginVertical: 10, marginHorizontal: 10 },
  labelText: { color: '#FFF', fontSize: 20, ...fonts.Bold },
  resultText: { fontSize: 32, ...fonts.Bold },
  imageIcon: { height: 40, width: 40, tintColor: '#000' },
  emptyText: {
    position: 'absolute',
    top: height / 1.6,
    alignSelf: 'center',
    color: '#FFF',
    fontSize: 20,
    maxWidth: '70%',
    ...fonts.Bold,
  },
});

export default App;
