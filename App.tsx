import React, { useEffect, useState } from 'react';
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
  Modal,
  Alert,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { BASE_URL, actions, plantList } from './constants';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [plantValue, setPlantValue] = useState<string | null>(null);
  const [options, setOptions] = useState<ImagePicker.CameraOptions | ImagePicker.ImageLibraryOptions>();
  const [cameraType, setCameraType] = useState<string | null>(null);

  const requestCameraPermission = async (options: any) => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'This App Camera Permission',
          message:
            'This App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        ImagePicker.launchCamera(options, async (response: any) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          } else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
          } else {
            const uri = response?.assets[0]?.uri;
            console.log(uri, 'uriiiii')
            const path = Platform.OS !== 'ios' ? uri : 'file://' + uri;
            getResult(path, response);
          }
        });
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getPrediction = async (params: any) => {
    try {
      const bodyFormData = new FormData();
      bodyFormData.append('file', {
        uri: params.uri,
        name: params.name,
        type: params.type,
      });
      const response = await axios.post(`${BASE_URL}/${plantValue}`, bodyFormData, {
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
    setModalVisible(true)
    setCameraType(type)
    setOptions(options)

  }, []);

  const openLibrary = (options: any) => {
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

  useEffect(() => {
    if (plantValue && cameraType) {
      if (cameraType == "capture") {
        requestCameraPermission(options)
      } else {
        openLibrary(options)
      }
    }
  }, [plantValue, cameraType, options])

  const clearOutput = () => {
    setResult('');
    setImage('');
  };

  const getResult = async (path: string, response: any) => {
    setModalVisible(false)
    setImage(path);
    setLabel('Predicting...');
    setResult('');
    const params = {
      uri: path,
      name: response.assets[0].fileName,
      type: response.assets[0].type || 'image/jpeg',
    };

    const res = await getPrediction(params);

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

      {image && <Text style={[styles.title, { fontSize: 22, fontWeight: "bold", top: 100, textTransform: "capitalize", color:"#FFFFFF" }]}> {'Selected Plant :'} <Text style={{ fontSize: 22, fontWeight: "bold" }}>{plantValue ? plantValue.split('_').join(" ") : ""}</Text></Text>}

      {(image?.length && (
        <>
          <TouchableOpacity onPress={clearOutput} style={[styles.clearStyle, { position: "absolute", zIndex: 999, marginTop: 74, marginRight: 36 }]}>
            <Image source={require('./assets/cancel.png')} style={styles.clearImage} />
          </TouchableOpacity>
          <Image source={{ uri: image }} style={styles.imageStyle} />
        </>
      )) ||
        null}
      {(result && label && (
        <View style={[styles.mainOuter, { width: "100%", paddingHorizontal: 40 }]}>
          <Text style={[styles.space, styles.labelText]}>
            {'Label: \n'}
            <Text style={styles.resultText}>{label}</Text>
          </Text>
          <Text style={[styles.space, styles.labelText]}>
            {'Confidence: \n'}
            <Text style={styles.resultText}>
              {parseFloat(parseFloat(result).toFixed(2)) * 100 + '%'}
            </Text>
          </Text>
        </View>
      )) ||
        (image && <Text style={styles.emptyText}>{label}</Text>) || (
          <Text style={[styles.emptyText, { fontSize: 20, fontWeight: "bold" }]}>
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
      <Modal

        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
          setCameraType(null)
          setOptions(undefined)
          setPlantValue(null)
        }}>
        <View style={styles.centeredView}>

          <TouchableOpacity style={{ flex: 1, backgroundColor: "transparent" }} onPress={() => {
            setModalVisible(false)
            setCameraType(null)
            setOptions(undefined)
            setPlantValue(null)
          }} />
          <View style={styles.modalView}>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ height: 30, fontSize: 18, fontWeight: "bold", marginBottom: 20, marginLeft: 20 }}>Select one of the plant below !</Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false)
                setCameraType(null)
                setOptions(undefined)
                setPlantValue(null)
              }}><Text style={{ fontWeight: "bold", fontSize: 25, marginLeft: 70 }}>X</Text></TouchableOpacity>
            </View>
            {plantList.map(({ title, value, image_path }, i) =>
              <View key={i} style={{ width: (Dimensions.get("window").width / 2) - 40, borderRadius: 10, borderWidth: 1, margin: 5, borderColor: "#d1d1d1" }}>
                <TouchableOpacity style={{ height: 200, width: (Dimensions.get("window").width / 2) - 40, justifyContent: "center", alignItems: "center" }} onPress={() => setPlantValue(value)}>
                  <Image source={image_path} style={{ flex: 1, height: 160, width: 160, resizeMode: "contain" }} />
                  <Text style={{ height: 30, fontSize: 18, fontWeight: "bold" }}>{title}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',

  },
  modalView: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "hidden",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default App;
