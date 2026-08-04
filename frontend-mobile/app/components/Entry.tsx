  import React from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";

  type EntryProps = {
  placeholder: string,
  value?: string,
  onChangeText ?: (text: string) => void;
  }


  export default function CampoTexto({placeholder, value, onChangeText}:EntryProps) {

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder=  {placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline={true}      
          numberOfLines={3}           
          textAlignVertical="top"     
        />
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    
    input: {
      fontSize: Platform.select({
          web: 15,
          android: 10,
          ios: 10
      }),

      
      width: 200,
      height: 40,
      fontWeight: 'bold',
      marginLeft: Platform.select({
      web: 150,
      android: 150,
      ios: 150,
  }),
      borderRadius: 8,
    },
  });
