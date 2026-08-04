import React, { useEffect, useState } from "react";

import {
View,
Text,
TextInput,
StyleSheet,
Pressable,
Alert,
Switch,
ActivityIndicator
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";

import { API_URL } from "../../../constants/api_url";



export default function EditarMarca(){


const {id} = useLocalSearchParams();


const [nombre,setNombre]=useState("");
const [descripcion,setDescripcion]=useState("");
const [activo,setActivo]=useState(true);

const [cargando,setCargando]=useState(true);
const [guardando,setGuardando]=useState(false);



// ==========================================
// CARGAR MARCA
// ==========================================

useEffect(()=>{

obtenerMarca();

},[]);



const obtenerMarca=async()=>{


try{


const response=await fetch(
`${API_URL}/marcas/${id}`
);



if(!response.ok){

throw new Error();

}



const data=await response.json();



setNombre(data.nombre);

setDescripcion(
data.descripcion || ""
);

setActivo(
data.activo
);



}catch(error){


Alert.alert(
"Error",
"No se pudo cargar la marca"
);


}finally{

setCargando(false);

}

};




// ==========================================
// ACTUALIZAR MARCA
// ==========================================


const actualizarMarca=async()=>{


if(!nombre.trim()){


Alert.alert(
"Error",
"El nombre es obligatorio"
);


return;

}



try{


setGuardando(true);



const response=await fetch(

`${API_URL}/marcas/${id}`,

{

method:"PUT",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

nombre:nombre,

descripcion:
descripcion || null,

activo:activo

})

}

);



if(!response.ok){

throw new Error();

}




Alert.alert(

"Correcto",

"Marca actualizada",

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

"No se pudo actualizar la marca"

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
color="#fff"
/>

</View>

)

}




return(


<View style={estilos.container}>


<Text style={estilos.titulo}>
Editar Marca
</Text>



<Text style={estilos.label}>
Nombre
</Text>


<TextInput

style={estilos.input}

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

onPress={actualizarMarca}

disabled={guardando}

>


<Text style={estilos.textoBoton}>

{
guardando
?
"Guardando..."
:
"Guardar cambios"
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





const estilos=StyleSheet.create({

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
marginBottom:8,
fontSize:15
},


input:{
height:50,
backgroundColor:"#111",
borderRadius:12,
paddingHorizontal:15,
color:"#fff",
marginBottom:20
},


textArea:{
height:100,
paddingTop:15,
textAlignVertical:"top"
},


estado:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:30
},


boton:{
height:50,
backgroundColor:"#fff",
borderRadius:12,
justifyContent:"center",
alignItems:"center",
marginBottom:15
},


textoBoton:{
color:"#000",
fontWeight:"bold"
},


cancelar:{
height:50,
borderWidth:1,
borderColor:"#333",
borderRadius:12,
justifyContent:"center",
alignItems:"center"
},


cancelarTexto:{
color:"#fff",
fontWeight:"bold"
},


cargando:{
flex:1,
backgroundColor:"#000",
justifyContent:"center",
alignItems:"center"
}


});