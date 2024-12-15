import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

interface UseCameraResult {
  takePhoto: () => Promise<string | null>;
  requestCameraPermission: () => Promise<boolean>;
  error: string | null;
}

export const useCamera = (): UseCameraResult => {
  const [error, setError] = useState<string | null>(null);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      setError('Kamera izni alınamadı');
      return false;
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setError('Kamera izni verilmedi');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (err) {
      setError('Fotoğraf çekilemedi');
      return null;
    }
  };

  return { takePhoto, requestCameraPermission, error };
};

