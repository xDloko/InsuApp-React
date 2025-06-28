import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";
import { Picker } from "@react-native-picker/picker";

const ProductosScreen = ({navigation})=>{
    const db = useSQLiteContext();
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion]=useState('');
    const [precio, setPrecio]= useState('');
    const [stock,setStock]= useState ('');
    const [categoriaId,setCategoriaId]= useState('');
    const [categorias,setCategorias]= useState([]);
    
    useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const results = await db.getAllAsync(`SELECT * FROM categoria`);
        setCategorias(results);
      } catch (error) {
        console.error(error);
        Alert.alert("Error al cargar categorías");
      };
    };
    fetchCategorias();
    }, []);

    const AgregarProducto = async () => {
        if (!nombre || !descripcion || !precio || !stock || !categoriaId) {
            Alert.alert('Error', 'Porfavor Completa los campos');
            return;
        }
        try {
            await db.runAsync(
                'INSERT INTO productos ( nombre,descripcion,precio,stock,id_categoria) VALUES (?,?,?,?,?);',
                [nombre,descripcion,parseFloat(precio),parseInt(stock), parseInt(categoriaId)]
            );
            Alert.alert('Exito','Producto agregado correctamente');
            setNombre('');
            setDescripcion('');
            setPrecio('');
            setStock('');
            setCategoriaId('');
        } catch (error) {
            console.log(error);
            Alert.alert('Error al agregar el Producto')
            
        }
    };
    return(
        <View style={styles.container}>
            <Text style={styles.title}>Agregar Producto</Text>
            <TextInput
            placeholder="Nombre del producto"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
            />
            <TextInput
            placeholder="Descripción del producto"
            value={descripcion}
            onChangeText={setDescripcion}
            style={styles.input}
            />
            <TextInput
            placeholder="Precio del producto"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="numeric"
            style={styles.input}
            />
            <TextInput
            placeholder="Cantidad para Stock"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            style={styles.input}
            />

           <Picker
           selectedValue={categoriaId}
           onValueChange={(itemValue) => setCategoriaId(itemValue)}
           style={styles.input}
           >
          <Picker.Item label="Selecciona una categoría" value="" />
          {categorias.map((cat) => (
            <Picker.Item
            key={cat.id}
            label={cat.nombre_categoria}
            value={cat.id}
            />
        ))}
      </Picker>
      <View style={styles.buttonContainer}>
        <Button title="Agregar Producto" onPress={AgregarProducto}color="#1f4f66" />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Ver Productos" onPress={() => navigation.navigate('ListaProductos')} color="#1f4f66"/>
      </View>
      
      
       
        </View>
        
    )


}
const styles = StyleSheet.create({
  container: { padding: 20 },
  buttonContainer: {
    
    width: '80%',
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden', // para que el botón respete bordes redondeados
  },
  title: { fontSize: 22, marginBottom: 15 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 5 },
});

export default ProductosScreen;