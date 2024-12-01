import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomePage({ navigation }) {
    return (
        <ImageBackground
            source={require('./assets/bg.png')}
            style={styles.backgroundImage}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>AI Object Detective</Text>
                    <Text style={styles.subtitle}>Discover the world around you</Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Camera')}
                    >
                        <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Open Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Import Image')}
                    >
                        <MaterialIcons name="photo-library" size={24} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Import Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Game')}
                    >
                        <MaterialIcons name="sports-esports" size={24} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Play the detective game</Text>
                    </TouchableOpacity>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 40,
        textAlign: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6200EE',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginTop: 20,
        width: '80%',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
    },
});