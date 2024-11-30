import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import "@tensorflow/tfjs-react-native";
import * as tf from '@tensorflow/tfjs';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';


export default function CameraPage() {
    const [model, setModel] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [facing, setFacing] = useState('back');
    const [permission, setPermission] = useState(null);

    const cameraRef = useRef(null);
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setPermission(status === 'granted');

            await tf.ready();

            const loadedModel = await cocoSsd.load();
            setModel(loadedModel);
            console.log('COCO-SSD model loaded successfully');
        })();
    }, []);

    if (permission === null) {
        return <View />;
    }
    if (permission === false) {
        return <Text>No access to camera</Text>;
    }

    const detectObjects = async () => {
        if (cameraRef.current && model) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });

                const manipulatedImage = await ImageManipulator.manipulateAsync(
                    photo.uri,
                    [{ resize: { width: 640, height: 480 } }],
                    { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
                );

                const imageAssetPath = manipulatedImage.uri;
                let imageTensor;


                if (Platform.OS === 'web') {
                    const response = await fetch(imageAssetPath);
                    const blob = await response.blob();
                    const imageBitmap = await createImageBitmap(blob);
                    imageTensor = tf.browser.fromPixels(imageBitmap);
                } else {
                    // Load the image into a tensor
                    const imgB64 = await FileSystem.readAsStringAsync(imageAssetPath, { encoding: FileSystem.EncodingType.Base64 });
                    const rawImageData = tf.util.encodeString(imgB64, 'base64').buffer;
                    const imageData = new Uint8Array(rawImageData)

                    imageTensor = decodeJpeg(imageData);
                }

                if (imageTensor) {
                    const predictionsResult = await model.detect(imageTensor);
                    setPredictions(predictionsResult);
                    console.log('Detected objects:', predictionsResult);

                    // Dispose tensor to free up memory
                    imageTensor.dispose();
                } else {
                    console.error('Image tensor could not be created.');
                }
            } catch (error) {
                console.error('Error during detection:', error);
            }
        }
    };

    const toggleCameraType = () => {
        setFacing((prevFacing) => (prevFacing === 'back' ? 'front' : 'back'));
    };

    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
                <Svg style={styles.overlay}>
                    {predictions.map((prediction, index) => {
                        const [x, y, width, height] = prediction.bbox;
                        let adjustedX;


                        const adjustedY = (y / 480) * screenHeight;
                        if (Platform.OS === 'web') {
                            adjustedX = facing === 'back'
                                ? screenWidth - (x / 640) * screenWidth - (width / 640) * screenWidth
                                : (x / 640) * screenWidth;
                        } else {
                            adjustedX = (x / 640) * screenWidth;

                        }
                        const adjustedWidth = (width / 640) * screenWidth;
                        const adjustedHeight = (height / 480) * screenHeight;


                        return (
                            <React.Fragment key={index}>
                                <Rect
                                    x={adjustedX}
                                    y={adjustedY}
                                    width={adjustedWidth}
                                    height={adjustedHeight}
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
                    <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraType}>
                        <Text style={styles.buttonText}>Flip Camera</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
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
        flexGrow: 1,
        marginRight: 10,
    },
    toggleButton: {
        backgroundColor: '#FF5722',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        flexGrow: 1,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});