import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

export default function App() {
  const [model, setModel] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    (async () => {
      await tf.ready();
      const modelJson  = require('./assets/tfjs_model/model.json');
      const modelWeights = require('./assets/tfjs_model/group1-shard1of1.bin');
      const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
      setModel(model);
    })();
  }, []);

  const detectObjects = async () => {
    if (cameraRef.current && model) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });

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

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <Svg style={styles.overlay}>
          {predictions.map((prediction, index) => {
            const [x, y, width, height] = prediction.bbox;

            const adjustedX = facing === 'back'
              ? screenWidth - (x / 640) * screenWidth - (width / 640) * screenWidth
              : (x / 640) * screenWidth;

            const adjustedY = (y / 480) * screenHeight;

            return (
              <React.Fragment key={index}>
                <Rect
                  x={adjustedX}
                  y={adjustedY}
                  width={(width / 640) * screenWidth}
                  height={(height / 480) * screenHeight}
                  stroke="#00FF00"
                  strokeWidth="3"
                  fill="none"
                  rx="4"
                />
                <SvgText
                  x={adjustedX}
                  y={adjustedY - 10}
                  fill="#00FF00"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {`${prediction.class} (${Math.round(prediction.score * 100)}%)`}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.detectButton} onPress={detectObjects}>
            <Text style={styles.buttonText}>Detecteer Objecten</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  detectButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
