import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";

const ListaProductosScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [productos, setProductos] = useState([]);

  // Función para cargar productos
  const fetchProductos = async () => {
    try {
      const results = await db.getAllAsync(`
        SELECT p.*, c.nombre_categoria 
        FROM productos p
        LEFT JOIN categoria c ON p.id_categoria = c.id
      `);
      setProductos(results);
    } catch (error) {
      console.log(error);
    }
  };

  // Función para eliminar producto
  const handleEliminar = async (id) => {
    try {
      await db.runAsync(`DELETE FROM productos WHERE id = ?`, [id]);
      Alert.alert('Producto eliminado');
      fetchProductos(); // Recargar lista
    } catch (error) {
      console.log(error);
      Alert.alert('Error al eliminar');
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Productos</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.name}>{item.nombre}</Text>
            <Text>Descripción: {item.descripcion}</Text>
            <Text>Precio: ${item.precio}</Text>
            <Text>Stock: {item.stock}</Text>
            <Text>Categoría: {item.nombre_categoria || 'Sin categoría'}</Text>
            <Button
              title="Eliminar"
              onPress={() => handleEliminar(item.id)}
              color="red"
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 15 },
  itemContainer: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  name: { fontWeight: 'bold', fontSize: 16 },
});

export default ListaProductosScreen;
