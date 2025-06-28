import React, { useState} from "react";
import {View, Text, TextInput, Button, Stylesheet, Alert} from 'react-native'

const Main = () =>{
    // Hacer un menu visual para que el usuario pueda seleccionar las opciones registrar un producto, registrar una venta, ver productos, ver ventas, ver categorias, registrar categoria
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionPress = (option) => {
        setSelectedOption(option);
        Alert.alert(`Seleccionaste: ${option}`);
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Menú Principal</Text>
            <Button title="Ver Productos" onPress={() => handleOptionPress('Productos')} />
            <Button title="Ver Ventas" onPress={() => handleOptionPress('Ventas')} />
            <Button title="Ver Categorías" onPress={() => handleOptionPress('Categorías')} />
            
        </View>
    );


    
    
}


export default Main;

