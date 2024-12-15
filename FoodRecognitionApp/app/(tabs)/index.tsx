import { View, Image, ScrollView, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from '../../src/components/common/Button';
import { useCamera } from '../../src/hooks/useCamera';
import { useImagePicker } from '../../src/hooks/useImagePicker';
import { colors } from '../../src/constants/colors';
import React from 'react';

export default function Home() {
  const { takePhoto } = useCamera();
  const { pickImage } = useImagePicker();

  const handleCameraPress = async () => {
    const uri = await takePhoto();
    if (uri) {
      router.push({
        pathname: "/result",
        params: { imageUri: uri }
      });
    }
  };

  const handleGalleryPress = async () => {
    const uri = await pickImage();
    if (uri) {
      router.push({
        pathname: "/result",
        params: { imageUri: uri }
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          Yemek Tanıma
        </Text>
      </Surface>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.imageContainer} elevation={1}>
          <View style={styles.placeholder}>
            <Text variant="bodyLarge">
              Lütfen bir fotoğraf seçin veya çekin
            </Text>
          </View>
        </Surface>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleCameraPress}
            icon="camera"
            style={styles.button}
          >
            Fotoğraf Çek
          </Button>

          <Button
            mode="contained"
            onPress={handleGalleryPress}
            icon="image"
            style={styles.button}
          >
            Galeriden Seç
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.surface,
    paddingTop: 48,
  },
  title: {
    textAlign: 'center',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 0.48,
  },
});