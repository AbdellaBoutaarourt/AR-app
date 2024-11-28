import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

export default function App() {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

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
                  stroke="red"
                  strokeWidth="2"
                  fill="none"
                />
                <SvgText
                  x={adjustedX}
                  y={adjustedY - 5}
                  fill="red"
                  fontSize="16"
                  fontWeight="bold"
                >
                  {`${prediction.class} (${Math.round(prediction.score * 100)}%)`}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={detectObjects}>
            <Text style={styles.text}>Detecteer Objecten</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
});
