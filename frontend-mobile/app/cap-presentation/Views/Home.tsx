import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextoNormal } from "../components/TextoNormal";
import { Titulos } from "../components/Titulos";

export default function DevolverHome() {
  return (
    <SafeAreaView style={estilos.safe}>
      <View style={estilos.centrado}>
        <Titulos titulo="Te amo mi amor" tamanio={30} color="black"/>
        <TextoNormal
          style={{ marginBottom: 5 }}
          titulo="¿Que quieres hacer hoy?"
        />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});