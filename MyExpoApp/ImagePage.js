import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Platform, ActivityIndicator, SafeAreaView, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';



const screenWidth = Dimensions.get('window').width;

export default function ImportImagePage() {
    const [imageUri, setImageUri] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [model, setModel] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(true);


    useEffect(() => {
        const loadModel = async () => {
            setIsModelLoading(true);
            setIsLoading(true)
            try {
                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                console.log('COCO-SSD model loaded successfully');
            } catch (error) {
                console.error('Error loading model:', error);
            } finally {
                setIsModelLoading(false);
                setIsLoading(false)
            }
        };
        loadModel();
    }, []);
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            base64: true,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            detectObjects(result.assets[0].uri, result.assets[0].base64);
        } else {
            alert('You did not select any image.');
        }
    };

    const detectObjects = async (uri, base64) => {
        if (model) {
            try {
                let imageData;

                if (Platform.OS === 'web') {
                    if (!base64) {
                        console.error('Base64 data is not available for the selected image.');
                        return;
                    }
                    imageData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

                } else {
                    const imgB64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                    const rawImageData = tf.util.encodeString(imgB64, 'base64').buffer;
                    imageData = new Uint8Array(rawImageData);
                }

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
        <ImageBackground
            source={require('./assets/bg.png')}
            style={styles.backgroundImage}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>AI Object Detector</Text>

                    <TouchableOpacity
                        style={[styles.button, (isModelLoading || isLoading) && styles.buttonDisabled]}
                        onPress={pickImage}
                        disabled={isModelLoading || isLoading}
                    >
                        <MaterialIcons name="add-a-photo" size={24} color="#FFFFFF" />
                        <Text style={styles.buttonText}>
                            {isModelLoading ? 'Loading Model...' : 'Choose Image'}
                        </Text>
                    </TouchableOpacity>

                    {imageUri && (
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.image}
                            />
                        </View>
                    )}

                    {(isLoading || isModelLoading) && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                            <Text style={styles.loadingText}>
                                {isModelLoading ? 'Loading AI model...' : 'Analyzing image...'}
                            </Text>
                        </View>
                    )}

                    {predictions.length > 0 && !isLoading && (
                        <View style={styles.resultsContainer}>
                            <Text style={styles.resultsTitle}>AI Detection Results:</Text>
                            {predictions.map((pred, index) => (
                                <Text key={index} style={styles.detectionText}>
                                    {pred.class} ({Math.round(pred.score * 100)}%)
                                </Text>
                            ))}
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    content: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6200EE',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginBottom: 30,
        width: '80%',
    },
    buttonDisabled: {
        backgroundColor: '#A0A0A0',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
    },
    imageContainer: {
        width: screenWidth - 40,
        height: 300,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 10,
    },
    resultsContainer: {
        width: screenWidth - 40,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 15,
        padding: 20,
    },
    resultsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    detectionText: {
        color: '#444',
        fontSize: 16,
        marginBottom: 5,
    },
});
