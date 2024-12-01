import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground, Dimensions, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function ImageGamePage() {
    const [imageUri, setImageUri] = useState(null);
    const [model, setModel] = useState(null);
    const [targetObject, setTargetObject] = useState('');
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [objects] = useState(['person', 'car', 'dog', 'cat', 'chair', 'bottle']);

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                selectNextTarget()
            } catch (error) {
                console.error('Error loading model:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadModel();
    }, []);

    const selectNextTarget = () => {
        const randomObject = objects[Math.floor(Math.random() * objects.length)];
        setTargetObject(randomObject);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            base64: true,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            analyzeImage(result.assets[0].uri, result.assets[0].base64);
        } else {
            alert('You did not select any image.');
        }
    };

    const analyzeImage = async (uri, base64) => {
        if (model) {
            setIsLoading(true);
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
                const predictions = await model.detect(imageTensor);

                const foundTarget = predictions.some(pred => pred.class.toLowerCase() === targetObject.toLowerCase());
                if (foundTarget) {
                    setScore(prevScore => prevScore + 1);
                    setMessage(`Great job! You found a ${targetObject}! Now find the next object.`);
                } else {
                    setMessage(`Sorry, there's no ${targetObject} in this image. Try another one!`);
                }
                selectNextTarget();

                imageTensor.dispose();
            } catch (error) {
                console.error('Error analyzing image:', error);
            } finally {
                setIsLoading(false);
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
                    <Text style={styles.title}>Object Detection Game</Text>
                    <Text style={styles.targetText}>Find a: {targetObject}</Text>
                    <Text style={styles.scoreText}>Score: {score}</Text>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={pickImage}
                        disabled={isLoading}
                    >
                        <MaterialIcons name="add-a-photo" size={24} color="#FFFFFF" />
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Analyzing...' : 'Choose Image'}
                        </Text>
                    </TouchableOpacity>

                    {imageUri && (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: imageUri }} style={styles.image} />
                        </View>
                    )}

                    <Text style={styles.messageText}>{message}</Text>
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
        marginBottom: 20,
        textAlign: 'center',
    },
    targetText: {
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 10,
    },
    scoreText: {
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 20,
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
    messageText: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
    },
});