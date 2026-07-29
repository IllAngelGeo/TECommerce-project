import React, {useContext} from "react";
import {useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView
} from "react-native";

import { auth } from "../../firebase/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { CartContext } from "../../../app/context/CartContext";


export default function Carrito(){

const {
 carrito,
 eliminarCarrito,
 actualizarCantidad,
 obtenerCarrito
}=useContext(CartContext);


const usuario = auth.currentUser;


useEffect(()=>{

if(usuario){

 obtenerCarrito(usuario.uid);

}

},[]);

const total = carrito.reduce(
 (suma,p)=>
 suma + (p.precio*p.cantidad),
0);



const cantidadTotal = carrito.reduce(
 (suma,p)=> suma+p.cantidad,
0);



const formatearPrecio=(precio:number)=>{
 return `$${precio.toLocaleString("es-MX")}`;
}



return(

<SafeAreaView style={styles.safe}>


<View style={styles.container}>


{/* HEADER */}

<View style={styles.header}>


<Pressable
style={styles.iconButton}
onPress={()=>router.back()}
>

<Ionicons
name="chevron-back"
size={28}
color="#FFF"
/>

</Pressable>



<View>

<Text style={styles.titulo}>
Mi carrito
</Text>

{
carrito.length>0 &&
<Text style={styles.subtitulo}>
{cantidadTotal} productos
</Text>
}

</View>



<View style={{width:40}}/>

</View>





{
carrito.length===0 ? (


<View style={styles.vacio}>


<View style={styles.vacioIcon}>

<Ionicons
name="cart-outline"
size={80}
color="#666"
/>

</View>



<Text style={styles.vacioTitulo}>
Tu carrito está vacío
</Text>


<Text style={styles.vacioTexto}>
Agrega productos para comenzar tu compra
</Text>



<Pressable
style={styles.explorar}
onPress={()=>router.back()}
>

<Text style={styles.explorarTexto}>
Explorar productos
</Text>

</Pressable>


</View>



):(


<>


<ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={{
paddingBottom:180
}}
>


{
carrito.map(producto=>(


<View key={producto.id_carrito} style={styles.card}>



<View style={styles.imagenContainer}>

{
producto.imagen ?

<Image
source={{
uri:producto.imagen
}}
style={styles.imagen}
resizeMode="contain"
/>

:

<Ionicons
name="image-outline"
size={50}
color="#555"
/>

}


</View>




<View style={styles.info}>


<Text
style={styles.nombre}
numberOfLines={2}
>
{producto.nombre}
</Text>



<Text style={styles.precio}>
{formatearPrecio(producto.precio)}
</Text>



<Text style={styles.subtotal}>
Subtotal:
{" "}
{formatearPrecio(
producto.precio*producto.cantidad
)}
</Text>




<View style={styles.controles}>


<Pressable
style={styles.control}
onPress={()=>{

if(usuario && producto.cantidad > 1){

actualizarCantidad(
 producto.id_carrito,
 producto.cantidad - 1,
 usuario.uid
);

}

}}
>

<Ionicons
name="remove"
size={20}
color="#FFF"
/>

</Pressable>



<Text style={styles.cantidad}>
{producto.cantidad}
</Text>




<Pressable
style={styles.control}
onPress={()=>{

if(usuario){

actualizarCantidad(
 producto.id_carrito,
 producto.cantidad + 1,
 usuario.uid
);

}

}}>

<Ionicons
name="add"
size={20}
color="#FFF"
/>

</Pressable>


<Pressable
style={styles.eliminar}
onPress={()=>{

if(usuario){

 eliminarCarrito(
    producto.id_carrito,
    usuario.uid
 )

}

}}>

<Ionicons
name="trash-outline"
size={22}
color="#FFF"
/>

</Pressable>


</View>



</View>


</View>


))
}



</ScrollView>





{/* FOOTER */}

<View style={styles.footer}>


<View>

<Text style={styles.totalLabel}>
Total
</Text>


<Text style={styles.total}>
{formatearPrecio(total)}
</Text>


</View>




<Pressable
style={styles.comprar}
>

<Ionicons
name="card-outline"
size={22}
color="#000"
/>


<Text style={styles.comprarTexto}>
Comprar
</Text>


</Pressable>


</View>


</>


)

}



</View>


</SafeAreaView>


)

}



const styles=StyleSheet.create({

safe:{
flex:1,
backgroundColor:"#000"
},


container:{
flex:1,
backgroundColor:"#000"
},


header:{
height:70,
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between",
paddingHorizontal:18,
borderBottomWidth:1,
borderBottomColor:"#1A1A1A"
},


iconButton:{
width:40,
height:40,
justifyContent:"center",
alignItems:"center"
},


titulo:{
color:"#FFF",
fontSize:22,
fontWeight:"bold"
},


subtitulo:{
color:"#777",
fontSize:12,
marginTop:3
},



card:{
marginHorizontal:18,
marginTop:15,
padding:15,
backgroundColor:"#0A0A0A",
borderRadius:18,
borderWidth:1,
borderColor:"#1A1A1A",
flexDirection:"row"
},



imagenContainer:{
width:95,
height:95,
backgroundColor:"#FFF",
borderRadius:15,
justifyContent:"center",
alignItems:"center"
},



imagen:{
width:"90%",
height:"90%"
},



info:{
flex:1,
marginLeft:15
},


nombre:{
color:"#FFF",
fontSize:15,
fontWeight:"bold"
},


precio:{
color:"#FFF",
fontSize:16,
fontWeight:"bold",
marginTop:6
},


subtotal:{
color:"#888",
fontSize:12,
marginTop:3
},



controles:{
flexDirection:"row",
alignItems:"center",
marginTop:12,
gap:10
},


control:{
width:32,
height:32,
borderRadius:16,
backgroundColor:"#1A1A1A",
justifyContent:"center",
alignItems:"center"
},


cantidad:{
color:"#FFF",
fontSize:17,
fontWeight:"bold",
width:25,
textAlign:"center"
},


eliminar:{
marginLeft:"auto"
},




footer:{
position:"absolute",
bottom:0,
left:0,
right:0,
backgroundColor:"#000",
borderTopWidth:1,
borderTopColor:"#222",
padding:18,
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between"
},



totalLabel:{
color:"#777",
fontSize:13
},


total:{
color:"#FFF",
fontSize:24,
fontWeight:"bold"
},



comprar:{
backgroundColor:"#FFF",
height:50,
paddingHorizontal:25,
borderRadius:15,
flexDirection:"row",
alignItems:"center",
gap:8
},


comprarTexto:{
color:"#000",
fontWeight:"bold",
fontSize:15
},




vacio:{
flex:1,
justifyContent:"center",
alignItems:"center",
padding:30
},


vacioIcon:{
width:130,
height:130,
borderRadius:65,
backgroundColor:"#0A0A0A",
justifyContent:"center",
alignItems:"center"
},


vacioTitulo:{
color:"#FFF",
fontSize:20,
fontWeight:"bold",
marginTop:20
},


vacioTexto:{
color:"#777",
marginTop:8,
textAlign:"center"
},


explorar:{
marginTop:25,
backgroundColor:"#FFF",
paddingHorizontal:25,
paddingVertical:14,
borderRadius:12
},


explorarTexto:{
color:"#000",
fontWeight:"bold"
}



});