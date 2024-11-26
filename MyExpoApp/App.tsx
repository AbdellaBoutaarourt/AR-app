import React, { useEffect, useRef, useState } from 'react';
import {  StyleSheet, Text, View,TouchableOpacity} from 'react-native';
import {  CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export default function App() {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      await tf.ready();
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    })();
  }, []);

  const detectObjects = async () => {
    if (cameraRef.current && model) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          skipProcessing: true,
        });

        const image = new Image();
        image.src = photo.uri;

        image.onload = async () => {

          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context could not be created');
          ctx.drawImage(image, 0, 0);


        const imageTensor = tf.browser.fromPixels(canvas);

        const predictions = await model.detect(imageTensor);
        setPredictions(predictions);

        console.log('Detected objects:', predictions);
      };
      } catch (error) {
        console.error('Error during detection:', error);
      }
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={detectObjects}>
            <Text style={styles.text}>Detecteer Objecten</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      <View style={styles.predictions}>
        {predictions.map((prediction, index) => (
          <Text key={index} style={styles.predictionText}>
            {prediction.class} ({Math.round(prediction.score * 100)}%)
          </Text>
        ))}
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  predictions: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 10,
  },
  predictionText: {
    color: '#fff',
    fontSize: 16,
  },
});