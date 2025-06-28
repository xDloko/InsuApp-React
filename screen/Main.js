import React, { useState} from "react";
import { View, Text, Button, Alert, StyleSheet } from 'react-native';


const Main = ({navigation}) => {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionPress = (option) => {
        setSelectedOption(option);
        Alert.alert(`Seleccionaste: ${option}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido a tu Menú Principal</Text>
            <View style={styles.buttonContainer}>
                <Button title="Ver Productos" onPress={() => navigation.navigate('Productos')} color="#1f4f66" />

            </View>
            <View style={styles.buttonContainer}>
                <Button title="Ver Ventas" onPress={() => navigation.navigate('ListaVentas')} color="#1f4f66" />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Registrar Categoría" onPress={() => navigation.navigate('Categorias')} color="#1f4f66" />
            </View>
        </View>
  );

    
    
}
const styles =StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#f2f2f2', // fondo claro y elegante
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f4f66',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden', // para que el botón respete bordes redondeados
  },

})


export default Main;

