import React from "react";
import { StyleSheet, Text, TextStyle, View } from "react-native";

interface TitulosProps {
  titulo: string;
  tamanio?: number;
  color?: string;
  style?: TextStyle;
}

export function Titulos({
  tamanio = 50,
  color = "black",
  titulo,
  style,
}: TitulosProps) {
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.titulos,
          { fontSize: tamanio, color },
          style,
        ]}
      >
        {titulo}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },

  titulos: {
    fontWeight: "bold",
  },
});