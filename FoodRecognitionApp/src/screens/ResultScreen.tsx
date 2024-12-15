import React, { useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet } from 'react-native';
import { Text, Surface, Card } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useFoodAnalysis } from '../hooks/useFoodAnalysis';
import { colors } from '../constants/colors';

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

export const ResultScreen = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const { imageUri } = route.params;
  const { analyzeFood, result, loading, error } = useFoodAnalysis();

  useEffect(() => {
    if (imageUri) {
      analyzeFood(imageUri);
    }
  }, [imageUri]);

  if (loading) {
    return <LoadingSpinner message="Yemek analiz ediliyor..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </Surface>

      {result && (
        <View style={styles.resultContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.foodName}>
                {result.foodName}
              </Text>
              <Text variant="bodyMedium" style={styles.confidence}>
                Eşleşme Oranı: %{(result.confidence * 100).toFixed(1)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.recipeTitle}>
                Tarif
              </Text>
              <Text variant="bodyMedium" style={styles.recipe}>
                {result.recipe}
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  resultContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  foodName: {
    marginBottom: 8,
    color: colors.text,
  },
  confidence: {
    color: colors.text,
    opacity: 0.7,
  },
  recipeTitle: {
    marginBottom: 8,
    color: colors.text,
  },
  recipe: {
    lineHeight: 24,
    color: colors.text,
  },
});