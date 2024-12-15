import React, { useState } from 'react';
import { View, Image, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useCamera } from '../hooks/useCamera';
import { useImagePicker } from '../hooks/useImagePicker';
import { colors } from '../constants/colors';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export const HomeScreen = ({ navigation }: Props) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { takePhoto, error: cameraError } = useCamera();
  const { pickImage, error: imagePickerError } = useImagePicker();

  const handleCameraPress = async () => {
    const uri = await takePhoto();
    if (uri) {
      setImageUri(uri);
    }
  };

  const handleGalleryPress = async () => {
    const uri = await pickImage();
    if (uri) {
      setImageUri(uri);
    }
  };

  const handleAnalyze = () => {
    if (imageUri) {
      navigation.navigate('Result', { imageUri });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Yükleniyor..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Yemek Tanıma
        </Text>
      </Surface>

      <View style={styles.content}>
        <Surface style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text variant="bodyLarge">
                Lütfen bir fotoğraf seçin veya çekin
              </Text>
            </View>
          )}
        </Surface>

        {(cameraError || imagePickerError) && (
          <ErrorMessage 
            message={cameraError || imagePickerError || 'Bir hata oluştu'} 
          />
        )}

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

        {imageUri && (
          <Button
            mode="contained"
            onPress={handleAnalyze}
            icon="magnify"
            style={styles.analyzeButton}
          >
            Yemeği Analiz Et
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  title: {
    textAlign: 'center',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  analyzeButton: {
    marginTop: 8,
  },
});