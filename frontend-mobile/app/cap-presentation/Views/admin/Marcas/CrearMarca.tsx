import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Switch,
} from "react-native";

import { router } from "expo-router";
import { API_URL } from "../../../constants/api_url";


export default function CrearMarca() {


const [nombre,setNombre] = useState("");
const [descripcion,setDescripcion] = useState("");
const [activo,setActivo] = useState(true);
const [cargando,setCargando] = useState(false);



// ==========================================
// CREAR MARCA
// ==========================================

const crearMarca = async()=>{


if(!nombre.trim()){

Alert.alert(
"Error",
"El nombre de la marca es obligatorio"
);

return;

}


try{


setCargando(true);



const response = await fetch(
`${API_URL}/marcas`,
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

nombre:nombre,
descripcion:descripcion || null,
activo:activo

})

}
);



if(!response.ok){

throw new Error();

}



Alert.alert(
"Correcto",
"Marca creada correctamente",
[
{
text:"OK",
onPress:()=>router.back()
}
]
);



}catch(error){


Alert.alert(
"Error",
"No se pudo crear la marca"
);


}finally{

setCargando(false);

}


}




return(

<View style={estilos.container}>


<Text style={estilos.titulo}>
Crear Marca
</Text>



<Text style={estilos.label}>
Nombre
</Text>


<TextInput

style={estilos.input}

placeholder="Ejemplo: ASUS"

placeholderTextColor="#666"

value={nombre}

onChangeText={setNombre}

/>



<Text style={estilos.label}>
Descripción
</Text>


<TextInput

style={[
estilos.input,
estilos.textArea
]}

placeholder="Descripción de la marca"

placeholderTextColor="#666"

value={descripcion}

onChangeText={setDescripcion}

multiline

/>



<View style={estilos.estado}>


<Text style={estilos.label}>
Marca activa
</Text>


<Switch

value={activo}

onValueChange={setActivo}

/>


</View>



<Pressable

style={estilos.boton}

onPress={crearMarca}

disabled={cargando}

>


<Text style={estilos.textoBoton}>

{
cargando
?
"Guardando..."
:
"Crear Marca"
}

</Text>


</Pressable>



<Pressable

style={estilos.cancelar}

onPress={()=>router.back()}

>


<Text style={estilos.cancelarTexto}>
Cancelar
</Text>


</Pressable>



</View>

)

}



const estilos = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000",
padding:25,
paddingTop:60
},


titulo:{
color:"#fff",
fontSize:24,
fontWeight:"bold",
marginBottom:30
},


label:{
color:"#fff",
fontSize:15,
marginBottom:8
},


input:{
backgroundColor:"#111",
height:50,
borderRadius:12,
paddingHorizontal:15,
color:"#fff",
marginBottom:20
},


textArea:{
height:100,
textAlignVertical:"top",
paddingTop:15
},


estado:{
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between",
marginBottom:30
},


boton:{
backgroundColor:"#fff",
height:50,
borderRadius:12,
alignItems:"center",
justifyContent:"center",
marginBottom:15
},


textoBoton:{
color:"#000",
fontWeight:"bold",
fontSize:16
},


cancelar:{
height:50,
borderRadius:12,
borderWidth:1,
borderColor:"#333",
alignItems:"center",
justifyContent:"center"
},


cancelarTexto:{
color:"#fff",
fontWeight:"bold"
}


});