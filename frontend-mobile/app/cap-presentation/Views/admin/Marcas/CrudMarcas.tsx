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
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { API_URL } from "../../../constants/api_url";


interface Marca {

  id_marca:number;
  nombre:string;
  descripcion?:string;
  activo:boolean;
  fecha_creacion:string;

}



export default function CrudMarcas(){


const [marcas,setMarcas]=useState<Marca[]>([]);
const [cargando,setCargando]=useState(true);
const [busqueda,setBusqueda]=useState("");
const [menuVisible, setMenuVisible] = useState(false);


useEffect(()=>{

obtenerMarcas();

},[]);




// ==========================================
// OBTENER MARCAS
// ==========================================

const obtenerMarcas = async()=>{


try{


setCargando(true);


const response = await fetch(
`${API_URL}/marcas`
);



if(!response.ok){

throw new Error();

}


const data = await response.json();


setMarcas(data);



}catch(error){


Alert.alert(
"Error",
"No se pudieron cargar las marcas"
);



}finally{

setCargando(false);

}


}




// ==========================================
// ELIMINAR
// ==========================================

const eliminarMarca=(id:number,nombre:string)=>{


Alert.alert(

"Eliminar marca",

`¿Eliminar ${nombre}?`,

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


const response = await fetch(

`${API_URL}/marcas/${id}`,

{

method:"DELETE"

}

);



if(!response.ok){

throw new Error();

}



setMarcas(
marcas.filter(
(item)=>item.id_marca!==id
)
);



Alert.alert(
"Correcto",
"Marca eliminada"
);



}catch(error){


Alert.alert(
"Error",
"No se pudo eliminar la marca"
);



}



}





// ==========================================
// FILTRO
// ==========================================


const marcasFiltradas = marcas.filter(

(item)=>

item.nombre
.toLowerCase()
.includes(
busqueda.toLowerCase()
)

);




// ==========================================
// CARD
// ==========================================


const renderMarca=({item}:{item:Marca})=>(


<View style={estilos.card}>


<View style={estilos.icono}>
  <Text style={estilos.letraMarca}>
    {item.nombre.charAt(0).toUpperCase()}
  </Text>
</View>


<View style={estilos.info}>


<Text style={estilos.nombre}>

{item.nombre}

</Text>



<Text style={estilos.descripcion}>

{
item.descripcion ||
"Sin descripción"
}

</Text>



<Text style={estilos.estado}>

{
item.activo
?
"Marca activa"
:
"Marca inactiva"
}

</Text>


</View>




<View style={estilos.acciones}>


<Pressable

style={estilos.boton}

onPress={()=>router.push({

pathname:
"/cap-presentation/Views/admin/Marcas/EditarMarca",

params:{
id:item.id_marca
}

})}

>


<Ionicons

name="create-outline"

size={22}

color="#FFFFFF"

/>


</Pressable>





<Pressable

style={estilos.boton}

onPress={()=>eliminarMarca(
item.id_marca,
item.nombre
)}

>


<Ionicons

name="trash-outline"

size={22}

color="#FFFFFF"

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
color="#FFFFFF"
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
  Marcas
</Text>


<Pressable

style={estilos.agregar}

onPress={()=>router.push(
"/cap-presentation/Views/admin/Marcas/CrearMarca"
)}

>


<Ionicons
name="add"
size={22}
color="#000"
/>


<Text style={estilos.textoAgregar}>
Nueva
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

placeholder="Buscar marca..."

placeholderTextColor="#666"

value={busqueda}

onChangeText={setBusqueda}

/>


</View>





<FlatList

data={marcasFiltradas}

keyExtractor={
(item)=>item.id_marca.toString()
}

renderItem={renderMarca}

onRefresh={obtenerMarcas}

refreshing={cargando}


/>

<MenuLateral
  visible={menuVisible}
  onClose={() => setMenuVisible(false)}
  seccionActual="marcas"
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


icono:{
width:60,
height:60,
borderRadius:12,
backgroundColor:"#111",
justifyContent:"center",
alignItems:"center"
},


info:{
flex:1,
marginLeft:12
},


nombre:{
color:"#fff",
fontSize:16,
fontWeight:"bold"
},


descripcion:{
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
borderRadius:10,
backgroundColor:"#1A1A1A",
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
},

letraMarca:{
  color:"#FFFFFF",
  fontSize:28,
  fontWeight:"bold"
},

});