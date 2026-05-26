import React from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";


/* Propiedades de la interfaz */

interface ImagenesProps{
  source: number | { uri: string }; // number si es source, y uri si es url
  width?: number;
  height?: number;
  style?: ViewStyle;
}

/** Componente a exportar  */
export const Imagen = ( {source, width,height, style}:ImagenesProps ) =>{
return (

    <View style={[styles.container, {width: width, height: height}, style]}>
    <Image   style={{ width: '100%', height: '100%' }} source={source}/>
    </View>

);

}

// Estilos
   const styles = StyleSheet.create({
      container: {
        justifyContent: 'center',
        alignItems: 'center',
      },

    imagenes: {
      width: 50,
      height: 50,
    }

});
