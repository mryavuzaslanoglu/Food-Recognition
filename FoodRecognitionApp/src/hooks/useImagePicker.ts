
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

interface UseImagePickerResult {
  pickImage: () => Promise<string | null>;
  error: string | null;
}

export const useImagePicker = (): UseImagePickerResult => {
  const [error, setError] = useState<string | null>(null);

  const pickImage = async (): Promise<string | null> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
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
      setError('Fotoğraf seçilemedi');
      return null;
    }
  };

  return { pickImage, error };
};


