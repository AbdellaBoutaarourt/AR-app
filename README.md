# Augmented Reality App Project

AI Object Detective is a cross-platform Augmented Reality (AR) application that combines object recognition with interactive AR content. The app utilizes machine learning to recognize objects in the real world through the device's camera.

## Features

- **Object Recognition:** Uses machine learning (TensorFlow.js and COCO-SSD model) for real-time object detection.
- **Camera Mode and Image Import:** Supports both live camera detection and object recognition on imported images.
- **Interactive Game Mode:** Tests users' object recognition skills in a fun and engaging way.
- **Cross-Platform Support:** Compatible with iOS, Android, and web platforms.

## Technical Details

- **Development Tools:**
  - React Native and Expo for cross-platform development.
  - TensorFlow.js for machine learning-based object recognition.
  - `react-native-svg` for drawing bounding boxes around detected objects.
  - `expo-camera` for camera functionality.
  - `expo-image-picker` for importing images from the device.

## Setup Instructions

Follow these steps to set up the project on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version) – You can download it from [nodejs.org](https://nodejs.org/).
- **npm** (comes with Node.js) – This is used to manage project dependencies.
- **Expo CLI** – If you don't have Expo CLI installed, you can install it globally by running:
  ```bash
  npm install -g expo-cli

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AbdellaBoutaarourt/AR-app.git
   cd https://github.com/AbdellaBoutaarourt/AR-app.git

2. **Install project dependencies:**
   ```bash
   cd MyexpoApp
   npm install --legacy-peer-deps

3. **Start the project:**
   ```bash
   cd ../MyexpoApp
   npm start

4. **Access the Application: Open http://localhost:8081 in your web browser or scan the QR code in the terminal with your mobile on expo app**

## Folder Structure


### `MyexpoApp/`
- `expo/`
- `assets/`
- `components/`
- `App.json`
- `App.js`
- `index.ts`
- `metro.config`
- `tsconfig.json`
### `README.md`



## SOURCES

Here are the sources and libraries used in the development:

- **Expo**: A framework and platform for universal React applications. [Expo Documentation](https://docs.expo.dev/get-started/create-a-project/)
- **TensorFlow.js**: An open-source library for machine learning for react native. [TensorFlow.js react native api](https://js.tensorflow.org/api_react_native/latest/)
- **COCO-SSD Model**: A pre-trained model for object detection, part of the TensorFlow.js library. [COCO-SSD Model github](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd)
- **react-native-svg**: A library for rendering SVGs in React Native. [react-native-svg GitHub](https://docs.expo.dev/versions/latest/sdk/svg/)
- **expo-camera**: Expo's camera module for capturing photos and video. [expo-camera Documentation](https://docs.expo.dev/versions/latest/sdk/camera/)
- **expo-image-picker**: Expo's image picker module for selecting images from the device. [expo-image-picker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- **Navigator**: provides a way for  transition between screens where each new screen is placed on top of a stack. [Stack Navigator](https://reactnavigation.org/docs/stack-navigator/)
- **MaterialIcons**: for expo icons.[MaterialIcons](https://icons.expo.fyi/Index/)
- **Fashion MNIST with Keras**: example using tf.keras and Cloud TPUs to train a model on the [fashion MNIST dataset.](https://colab.research.google.com/github/tensorflow/tpu/blob/master/tools/colab/fashion_mnist.ipynb#scrollTo=RNo1Vfghpa8j)

### YouTube Tutorials

  - A YouTube to build an Object Detection [App with Tensorflow.JS](https://www.youtube.com/watch?v=uTdUUpfA83s&t=786s&ab_channel=NicholasRenotte).
  - Fashion Mnist Dataset training using [Tensorflow Python with Google Colab](https://www.youtube.com/watch?v=uTdUUpfA83s&t=786s&ab_channel=NicholasRenotte).

### ChatGPT Contributions

 -  [ChatGPT responses](https://chatgpt.com/share/674e38dc-9b0c-8008-b950-4dd0ed4407f8) that helps for fixing bug code for Mirroring Along the x-axis.
 -  A useful [ChatGPT responses](https://chatgpt.com/share/673b9dee-b6dc-8008-bb37-3613d2aa9fa5) for an error occurs because TensorFlow.js does not  support certain features or configurations in Keras models when Convert the Model.
-  [ChatGPT responses](https://chatgpt.com/share/674e3bec-08ac-8008-b0d6-f7b9014c4d2f) that try to fix assets files are not correctly loaded( did not work)
-  [ChatGPT responses](https://chatgpt.com/share/674e3d90-a18c-8008-a115-0cc6ab28bbb8) to fix detection on android did not work (needed to use expo-image-manipulator)
-   [ChatGPT responses](https://chatgpt.com/share/674e3ed1-96f8-8008-8b38-8ab48d1a8b3c) to fix bug on web did not work (expo-file-system is not available in a web environment)


