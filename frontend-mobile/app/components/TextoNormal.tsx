import React from "react";
import { StyleSheet, Text, View, ViewStyle } from 'react-native';


interface TextoNormalProps{
  titulo: string;  
  tamanio?: number; 
  color?: string; 
  style?: ViewStyle;
  fontWeight?: "normal" | "bold";
}


// Funcion a exportar
export function TextoNormal({
  tamanio = 15,
  color = 'black',
  titulo,
  style,
  fontWeight = "normal"
}: TextoNormalProps) {

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.textonormal,
          {
            fontSize: tamanio,
            color: color,
            fontWeight: fontWeight
          }
        ]}
      >
        {titulo}
      </Text>
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