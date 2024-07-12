import { ImageProps } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
interface Action {
    title: string;
    type: 'capture' | 'library';
    options: ImagePicker.CameraOptions | ImagePicker.ImageLibraryOptions;
    image_path:ImageProps;
  }

/* toggle includeExtra */
const includeExtra = true;

export const actions: Action[] = [
    {
      title: 'Take Image',
      type: 'capture',
      options: {
        saveToPhotos: true,
        mediaType: 'photo',
        includeBase64: true,
        includeExtra,
      },
      image_path: require('./assets/camera.png')
    },
    {
      title: 'Select Image',
      type: 'library',
      options: {
        selectionLimit: 0,
        mediaType: 'photo',
        includeBase64: true,
        includeExtra,
      },
      image_path: require('./assets/gal.png')
    },
    
  ];

// local url
// if you are using private API, keep it in env 
  export const BASE_URL = "http://10.0.2.2:8000/predict";
 