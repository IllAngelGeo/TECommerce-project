import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator
} from "react-native";

import { API_URL } from "../../../constants/api_url";


export default function EditarCategoria() {

  const { id } = useLocalSearchParams();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);



  useEffect(() => {
    obtenerCategoria();
  }, []);



  const obtenerCategoria = async () => {

    try {

      const response = await fetch(
        `${API_URL}/categorias/${id}`
      );


      if(!response.ok)
        throw new Error();



      const data = await response.json();


      setNombre(data.nombre);
      setDescripcion(data.descripcion ?? "");
      setActivo(data.activo);


    } catch(error){

      Alert.alert(
        "Error",
        "No se pudo cargar la categoría"
      );

    } finally {

      setCargando(false);

    }

  };




  const actualizarCategoria = async()=>{


    if(!nombre.trim()){

      Alert.alert(
        "Error",
        "El nombre es obligatorio"
      );

      return;

    }



    try{


      setGuardando(true);



      const response = await fetch(
        `${API_URL}/categorias/${id}`,
        {

          method:"PUT",

          headers:{
            "Content-Type":"application/json"
          },


          body:JSON.stringify({

            nombre:nombre.trim(),

            descripcion:descripcion.trim(),

            activo

          })

        }
      );



      if(!response.ok){

        const error = await response.text();

        console.log(error);

        throw new Error();

      }



      Alert.alert(
        "Correcto",
        "Categoría actualizada"
      );


      router.back();



    }catch(error){


      Alert.alert(
        "Error",
        "No se pudo actualizar la categoría"
      );


    }finally{

      setGuardando(false);

    }


  };





  if(cargando){

    return(

      <View style={estilos.cargando}>

        <ActivityIndicator
          size="large"
          color="#FFFFFF"
        />

      </View>

    )

  }





  return(

    <ScrollView style={estilos.safe}>


      <View style={estilos.header}>


        <Pressable
          onPress={()=>router.back()}
          style={estilos.botonAtras}
        >

          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />

        </Pressable>



        <Text style={estilos.titulo}>
          Editar categoría
        </Text>


      </View>





      <Text style={estilos.label}>
        Nombre
      </Text>


      <TextInput

        style={estilos.input}

        value={nombre}

        onChangeText={setNombre}

        placeholder="Nombre"

        placeholderTextColor="#666"

      />





      <Text style={estilos.label}>
        Descripción
      </Text>


      <TextInput

        style={[
          estilos.input,
          estilos.textArea
        ]}

        value={descripcion}

        onChangeText={setDescripcion}

        placeholder="Descripción"

        placeholderTextColor="#666"

        multiline

      />





      <View style={estilos.switchContainer}>


        <Text style={estilos.label}>
          Categoría activa
        </Text>


        <Switch

          value={activo}

          onValueChange={setActivo}

        />


      </View>





      <Pressable

        style={estilos.guardar}

        onPress={actualizarCategoria}

        disabled={guardando}

      >


        <Text style={estilos.guardarTexto}>

          {
            guardando
            ?
            "Guardando..."
            :
            "Actualizar categoría"
          }

        </Text>


      </Pressable>



    </ScrollView>

  )

}

const estilos = StyleSheet.create({

safe:{
  flex:1,
  backgroundColor:"#000000",
  paddingHorizontal:20,
  paddingTop:50,
},


header:{
  flexDirection:"row",
  alignItems:"center",
  marginBottom:30,
  gap:15,
},


botonAtras:{
  width:42,
  height:42,
  borderRadius:12,
  backgroundColor:"#111111",
  justifyContent:"center",
  alignItems:"center",
},


titulo:{
  color:"#FFFFFF",
  fontSize:22,
  fontWeight:"bold",
},




label:{
  color:"#FFFFFF",
  fontSize:14,
  fontWeight:"600",
  marginBottom:8,
  marginTop:15,
},




input:{
  height:50,
  backgroundColor:"#0A0A0A",
  borderRadius:12,
  borderWidth:1,
  borderColor:"#1A1A1A",
  paddingHorizontal:15,
  color:"#FFFFFF",
  fontSize:14,
},



textArea:{
  height:120,
  textAlignVertical:"top",
  paddingTop:15,
},





switchContainer:{
  marginTop:20,
  flexDirection:"row",
  alignItems:"center",
  justifyContent:"space-between",
  backgroundColor:"#0A0A0A",
  borderRadius:12,
  paddingHorizontal:15,
  paddingVertical:12,
  borderWidth:1,
  borderColor:"#1A1A1A",
},





guardar:{
  backgroundColor:"#FFFFFF",
  height:50,
  borderRadius:12,
  justifyContent:"center",
  alignItems:"center",
  marginTop:35,
  marginBottom:40,
},


guardarTexto:{
  color:"#000000",
  fontSize:15,
  fontWeight:"bold",
},

cargando:{
  flex:1,
  backgroundColor:"#000000",
  justifyContent:"center",
  alignItems:"center",
},

});
