import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';

const screenWidth = Dimensions.get('window').width;

export default function ImportImagePage() {
    const [imageUri, setImageUri] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [model, setModel] = useState(null);

    useEffect(() => {
        const loadModel = async () => {
            await tf.ready();
            const loadedModel = await cocoSsd.load();
            setModel(loadedModel);
        };
        loadModel();
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            base64: true,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            detectObjects(result.assets[0].uri);
        }
    };

    const detectObjects = async (uri) => {
        if (model) {
            try {
                const imgB64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                const rawImageData = tf.util.encodeString(imgB64, 'base64').buffer;
                const imageData = new Uint8Array(rawImageData);
                const imageTensor = decodeJpeg(imageData);
                const predictionsResult = await model.detect(imageTensor);
                setPredictions(predictionsResult);
                console.log('Detected objects:', predictionsResult);

                imageTensor.dispose();
            } catch (error) {
                console.error('Error detecting objects:', error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Import Image for Object Detection</Text>

            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Pick an Image</Text>
            </TouchableOpacity>

            {imageUri && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            )}

            {predictions.length > 0 && (
                <View style={styles.predictionsContainer}>
                    {predictions.map((prediction, index) => {
                        const [x, y, width, height] = prediction.bbox;
                        return (
                            <View key={index} style={[styles.predictionBox, { left: x, top: y, width, height }]}>
                                <Text style={styles.predictionText}>
                                    {prediction.class} ({Math.round(prediction.score * 100)}%)
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
    },
    title: {
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#6200EE',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        marginBottom: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    imageContainer: {
        marginTop: 20,
        width: screenWidth - 40,
        height: 300,
        borderWidth: 1,
        borderColor: '#FFF',
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    predictionsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    predictionBox: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#00FF00',
        borderRadius: 4,
    },
    predictionText: {
        color: '#00FF00',
        fontSize: 14,
        fontWeight: 'bold',
        position: 'absolute',
        top: -20,
        left: 0,
    },
});
