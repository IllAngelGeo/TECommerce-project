import React from "react";
import { Image, StyleSheet, ImageStyle } from "react-native";


interface ImagenesProps{
  source: number | { uri: string };
  width?: number;
  height?: number;
  style?: ImageStyle;
}


export const Imagen = ({
  source,
  width,
  height,
  style
}: ImagenesProps) => {

  return (
    <Image
      source={source}
      style={[
        styles.imagen,
        {
          width: width,
          height: height,
        },
        style
      ]}
    />
  );

};


const styles = StyleSheet.create({

  imagen:{
    resizeMode:"contain"
  }

});