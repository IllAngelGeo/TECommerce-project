import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { TextoNormal } from "./TextoNormal";

interface BotonProps {
  titulo: string;
  color?: string;
  textColor?: string;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  fontWeight?: "normal" | "bold";
  onPress?: () => void;
}

export const Boton = ({
  titulo,
  color = "#183326",
  textColor = "#FFFFFF",
  width,
  height = 50,
  style,
  fontWeight = "normal",
  onPress,
}: BotonProps) => {

  return (
    <Pressable
      style={[
        styles.boton,
        {
          backgroundColor: color,
          width: width,
          height: height,
        },
        style,
      ]}
      onPress={onPress}
    >
      <TextoNormal
        titulo={titulo}
        tamanio={13}
        color={textColor}
        fontWeight={fontWeight}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  boton:{
    borderRadius:10,
    justifyContent:"center",
    alignItems:"center",
    shadowColor:"#000",
    shadowRadius:5,
    elevation:5,
  },
});