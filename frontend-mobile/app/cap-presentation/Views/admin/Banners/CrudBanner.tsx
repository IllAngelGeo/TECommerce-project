import React, { useEffect, useState } from "react";
import MenuLateral from "../../../../components/MenuLateral";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { API_URL } from "../../../constants/api_url";


interface Banner {

  id_banner:number;
  titulo:string;
  subtitulo?:string;
  texto_boton?:string;
  imagen_url:string;
  activo:boolean;
  fecha_creacion:string;

}



export default function CrudBanner(){


const [banners,setBanners]=useState<Banner[]>([]);
const [cargando,setCargando]=useState(true);
const [busqueda,setBusqueda]=useState("");
  const [menuVisible, setMenuVisible] = useState(false);

// ==========================================
// CARGAR BANNERS
// ==========================================

useEffect(()=>{

obtenerBanners();

},[]);



const obtenerBanners=async()=>{


try{


setCargando(true);


const response=await fetch(
`${API_URL}/banners`
);



if(!response.ok){

throw new Error();

}



const data = await response.json();

setBanners(
  Array.isArray(data)
    ? data
    : []
);


}catch(error){


Alert.alert(
"Error",
"No se pudieron cargar los banners"
);


}finally{

setCargando(false);

}


};




// ==========================================
// ELIMINAR
// ==========================================

const eliminarBanner=(id:number,titulo:string)=>{


Alert.alert(

"Eliminar banner",

`¿Eliminar ${titulo}?`,

[

{
text:"Cancelar",
style:"cancel"
},

{
text:"Eliminar",
style:"destructive",

onPress:()=>confirmarEliminar(id)

}

]

);


}



const confirmarEliminar=async(id:number)=>{


try{


const response=await fetch(

`${API_URL}/banners/${id}`,

{

method:"DELETE"

}

);



if(!response.ok){

throw new Error();

}



setBanners(
banners.filter(
(item)=>item.id_banner!==id
)
);



Alert.alert(
"Correcto",
"Banner eliminado"
);



}catch(error){


Alert.alert(
"Error",
"No se pudo eliminar"
);


}


}




// ==========================================
// FILTRO
// ==========================================


const bannersFiltrados=banners.filter(

(item)=>

item.titulo
.toLowerCase()
.includes(
busqueda.toLowerCase()
)

);




// ==========================================
// CARD
// ==========================================


const renderBanner=({item}:{item:Banner})=>(


<View style={estilos.card}>


{
item.imagen_url ?

<Image

source={{
uri:item.imagen_url
}}

style={estilos.imagen}

/>

:

<View style={estilos.sinImagen}>

<Ionicons
name="image-outline"
size={35}
color="#777"
/>

</View>

}




<View style={estilos.info}>


<Text style={estilos.tituloCard}>

{item.titulo}

</Text>



<Text style={estilos.subtitulo}>

{
item.subtitulo ||
"Sin subtitulo"
}

</Text>



<Text style={estilos.estado}>

{
item.activo
?
"Activo"
:
"Inactivo"
}

</Text>



</View>




<View style={estilos.acciones}>

<Pressable

style={estilos.boton}

onPress={()=>eliminarBanner(
item.id_banner,
item.titulo
)}

>

<Ionicons

name="trash-outline"

size={22}

color="#fff"

/>

</Pressable>


</View>



</View>


);






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


<View style={estilos.header}>
  <Pressable
    style={estilos.menuButton}
    onPress={() => setMenuVisible(true)}
  >
    <Ionicons
      name="menu"
      size={28}
      color="#FFFFFF"
    />
  </Pressable>

<Text style={estilos.titulo}>

Banners

</Text>



<Pressable

style={estilos.agregar}

onPress={()=>router.push(
"/cap-presentation/Views/admin/Banners/CrearBanner"
)}

>


<Ionicons

name="add"

size={22}

color="#000"

/>


<Text style={estilos.textoAgregar}>

Nuevo

</Text>


</Pressable>


</View>





<View style={estilos.buscar}>


<Ionicons

name="search-outline"

size={20}

color="#777"

/>



<TextInput

style={estilos.input}

placeholder="Buscar banner..."

placeholderTextColor="#666"

value={busqueda}

onChangeText={setBusqueda}

/>


</View>





<FlatList

data={bannersFiltrados}

keyExtractor={
(item)=>item.id_banner.toString()
}

renderItem={renderBanner}

onRefresh={obtenerBanners}

refreshing={cargando}

/>

<MenuLateral
  visible={menuVisible}
  onClose={() => setMenuVisible(false)}
  seccionActual="banners"
/>

</View>


)


}

const estilos = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000",
paddingHorizontal:20,
paddingTop:50
},

header:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:20
},

titulo:{
color:"#fff",
fontSize:22,
fontWeight:"bold"
},

agregar:{
backgroundColor:"#fff",
height:42,
paddingHorizontal:15,
borderRadius:10,
flexDirection:"row",
alignItems:"center",
gap:5
},

textoAgregar:{
color:"#000",
fontWeight:"bold"
},

buscar:{
height:48,
backgroundColor:"#0A0A0A",
borderRadius:12,
flexDirection:"row",
alignItems:"center",
paddingHorizontal:15,
marginBottom:15
},

input:{
flex:1,
color:"#fff",
marginLeft:10
},

card:{
backgroundColor:"#0A0A0A",
borderRadius:15,
padding:15,
marginBottom:12,
flexDirection:"row",
alignItems:"center"
},

imagen:{
width:80,
height:60,
borderRadius:10
},

sinImagen:{
width:80,
height:60,
borderRadius:10,
backgroundColor:"#111",
justifyContent:"center",
alignItems:"center"
},

info:{
flex:1,
marginLeft:12
},

tituloCard:{
color:"#fff",
fontSize:16,
fontWeight:"bold"
},

subtitulo:{
color:"#888",
marginTop:5
},

estado:{
color:"#555",
marginTop:5,
fontSize:12
},

acciones:{
gap:10
},

boton:{
width:40,
height:40,
backgroundColor:"#1A1A1A",
borderRadius:10,
justifyContent:"center",
alignItems:"center"
},

cargando:{
flex:1,
backgroundColor:"#000",
justifyContent:"center",
alignItems:"center"
},

menuButton:{
  width:45,
  height:45,
  borderRadius:12,
  backgroundColor:"#1A1A1A",
  justifyContent:"center",
  alignItems:"center",
}

});