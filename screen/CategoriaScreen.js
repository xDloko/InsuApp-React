import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";

const CategoriaScreen = () => {
  const db = useSQLiteContext();
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [descripcionCategoria, setDescripcionCategoria] = useState('');

  const agregarCategoria = async () => {
    if (!nombreCategoria) {
      Alert.alert('Error', 'El nombre de la categoría es obligatorio');
      return;
    }

    try {
      await db.runAsync(
        'INSERT INTO categoria (nombre_categoria, descripcion_categoria) VALUES (?, ?)',
        [nombreCategoria, descripcionCategoria]
      );
      Alert.alert('Éxito', 'Categoría agregada correctamente');
      setNombreCategoria('');
      setDescripcionCategoria('');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudo agregar la categoría');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Categoría</Text>
      <TextInput
        placeholder="Nombre de la categoría"
        value={nombreCategoria}
        onChangeText={setNombreCategoria}
        style={styles.input}
      />
      <TextInput
        placeholder="Descripción de la categoría (opcional)"
        value={descripcionCategoria}
        onChangeText={setDescripcionCategoria}
        style={styles.input}
      />
      <Button title="Agregar Categoría" onPress={agregarCategoria} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 15 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 5 },
});

export default CategoriaScreen;
