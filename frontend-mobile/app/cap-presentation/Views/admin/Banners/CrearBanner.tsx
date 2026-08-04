import React, {useState} from "react";

import {
 View,
 Text,
 TextInput,
 Pressable,
 StyleSheet,
 Alert,
 Image,
 ActivityIndicator
} from "react-native";


import * as ImagePicker from "expo-image-picker";

import {router} from "expo-router";

import {Ionicons} from "@expo/vector-icons";

import {API_URL} from "../../../constants/api_url";



export default function CrearBanner(){


const [titulo,setTitulo]=useState("");
const [subtitulo,setSubtitulo]=useState("");
const [textoBoton,setTextoBoton]=useState("");

const [imagen,setImagen]=useState<any>(null);

const [cargando,setCargando]=useState(false);





// ==========================================
// SELECCIONAR IMAGEN
// ==========================================

const seleccionarImagen=async()=>{


const permiso =
await ImagePicker.requestMediaLibraryPermissionsAsync();


if(!permiso.granted){

Alert.alert(
"Permiso necesario",
"Permite acceder a tus imágenes"
);

return;

}



const resultado =
await ImagePicker.launchImageLibraryAsync({

mediaTypes:
ImagePicker.MediaTypeOptions.Images,

quality:0.8

});



if(!resultado.canceled){

setImagen(
resultado.assets[0]
);

}


};




// ==========================================
// CREAR BANNER
// ==========================================


const crearBanner=async()=>{


if(!titulo){

Alert.alert(
"Error",
"El título es obligatorio"
);

return;

}



try{


setCargando(true);



// CREAR REGISTRO

const response =
await fetch(
`${API_URL}/banners`,
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

titulo,

subtitulo:
subtitulo || null,

texto_boton:
textoBoton || null,

imagen_url:"",

activo:true

})

}

);



const data=await response.json();



if(!response.ok){

throw new Error(
data.error
);

}




const idBanner=data.id_banner;



// SUBIR IMAGEN

if(imagen){


const formData=new FormData();



formData.append(
"imagen",
{

uri:imagen.uri,

name:"banner.jpg",

type:"image/jpeg"

} as any

);



await fetch(

`${API_URL}/banners/${idBanner}/imagen`,

{

method:"POST",

body:formData

}

);


}



Alert.alert(
"Correcto",
"Banner creado correctamente"
);



router.back();



}catch(error:any){


Alert.alert(
"Error",
error.message
);


}finally{

setCargando(false);

}


};






return(


<View style={estilos.container}>


<Text style={estilos.titulo}>
Crear Banner
</Text>




<TextInput

style={estilos.input}

placeholder="Título"

placeholderTextColor="#777"

value={titulo}

onChangeText={setTitulo}

/>




<TextInput

style={estilos.input}

placeholder="Subtítulo"

placeholderTextColor="#777"

value={subtitulo}

onChangeText={setSubtitulo}

/>





<TextInput

style={estilos.input}

placeholder="Texto del botón"

placeholderTextColor="#777"

value={textoBoton}

onChangeText={setTextoBoton}

/>






<Pressable

style={estilos.imagenButton}

onPress={seleccionarImagen}

>


<Ionicons
name="image-outline"
size={25}
color="#fff"
/>


<Text style={estilos.texto}>
Seleccionar imagen
</Text>


</Pressable>





{
imagen &&

<Image

source={{
uri:imagen.uri
}}

style={estilos.preview}

/>

}





<Pressable

style={estilos.guardar}

onPress={crearBanner}

>


{
cargando ?

<ActivityIndicator color="#000"/>

:

<Text style={estilos.guardarTexto}>
Guardar Banner
</Text>

}


</Pressable>


</View>


)

}

const estilos=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000",
padding:20,
paddingTop:60
},


titulo:{
color:"#fff",
fontSize:24,
fontWeight:"bold",
marginBottom:30
},


input:{
height:50,
backgroundColor:"#111",
borderRadius:10,
paddingHorizontal:15,
color:"#fff",
marginBottom:15
},


imagenButton:{
height:50,
backgroundColor:"#1A1A1A",
borderRadius:10,
flexDirection:"row",
alignItems:"center",
justifyContent:"center",
gap:10,
marginTop:10
},


texto:{
color:"#fff"
},


preview:{
width:"100%",
height:180,
borderRadius:15,
marginTop:20
},


guardar:{
height:50,
backgroundColor:"#fff",
borderRadius:10,
alignItems:"center",
justifyContent:"center",
marginTop:30
},


guardarTexto:{
color:"#000",
fontWeight:"bold"
}


});