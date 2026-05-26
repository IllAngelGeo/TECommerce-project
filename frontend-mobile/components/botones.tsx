import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

 
interface BotonProps{
titulo: string,
color?: string,
width?: number,
height?: number,
style?: StyleProp<ViewStyle>;
onPress?: () => void;
}


/* Componente a exportar */
export const Boton = ( {titulo, color, width, height, style, onPress}:BotonProps) => {
return(

<Pressable style={[styles.boton, {backgroundColor: color, width: width, height: height}, style]} onPress={onPress}>
<Text style={styles.textoBoton}> {titulo} </Text>
</Pressable>

);
} 


/* Estilos */
 const styles = StyleSheet.create({
    boton: {
    backgroundColor: '#183326ff',
    top: 15,
    padding: 20,
    borderRadius: 10,
    height: 'auto',
    width: 'auto',
    shadowColor: "#000",
    shadowRadius: 5,
    justifyContent: 'center',
    elevation: 5, // sombra en Android
    },

    textoBoton: {
        color: 'white',
        textAlign: 'center',
        alignContent: 'center',

    }

});

