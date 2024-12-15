import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { colors } from '../../constants/colors';

interface ButtonProps {
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  style?: object;
}

export const Button = ({
  onPress,
  mode = 'contained',
  icon,
  loading = false,
  disabled = false,
  children,
  style,
}: ButtonProps) => {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      icon={icon}
      loading={loading}
      disabled={disabled}
      style={[styles.button, style]}
      labelStyle={styles.label}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 6,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});