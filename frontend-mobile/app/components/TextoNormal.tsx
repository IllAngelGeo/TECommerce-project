
import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';


interface TextoNormalProps{
  titulo: string;  
  tamanio?: number; 
  color?: string; 
  style?: ViewStyle ; 
}

// Funcion a exportar
    export function TextoNormal({tamanio=15,color='black', titulo, style}:TextoNormalProps) {
    return (
        <View style={[styles.container, style]}>
        <Text style={[styles.textonormal, {fontSize: tamanio, color: color}]}> {titulo}</Text>
        </View>
    );

    }
    const styles = StyleSheet.create({
      container: {
        justifyContent: 'center',
        alignItems: 'center',
      },

      textonormal: {
        fontSize: 15,
      }

    });
    