import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { useSQLiteContext } from "expo-sqlite";

const ListaVentasScreen = ({navigation}) => {

    const db = useSQLiteContext();
    const [ventas, setVentas] = useState([]);

    // Obtener todas las ventas con sus productos asociados
    const fetchVentas = async () => {
        try {
            // Primero obtenemos las ventas
            const ventasResults = await db.getAllAsync(
                `SELECT * FROM venta ORDER BY fecha DESC`
            );
            
            // Para cada venta, obtenemos sus productos
            const ventasConProductos = await Promise.all(
                ventasResults.map(async (venta) => {
                    const productos = await db.getAllAsync(
                        `SELECT pv.*, p.nombre as nombre_producto 
                         FROM productos_venta pv
                         JOIN productos p ON pv.id_producto = p.id
                         WHERE pv.id_venta = ?`,
                        [venta.id]
                    );
                    return { ...venta, productos };
                })
            );
            
            setVentas(ventasConProductos);
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "No se pudieron cargar las ventas");
        }
    };

    // Eliminar una venta y sus productos asociados
    const handleEliminar = async (idVenta) => {
        try {
            await db.runAsync("BEGIN TRANSACTION");
            
            // Primero eliminamos los productos asociados a la venta
            await db.runAsync(
                "DELETE FROM productos_venta WHERE id_venta = ?",
                [idVenta]
            );
            
            // Luego eliminamos la venta
            await db.runAsync(
                "DELETE FROM venta WHERE id = ?",
                [idVenta]
            );
            
            await db.runAsync("COMMIT");
            fetchVentas(); // Actualizamos la lista
            Alert.alert("Éxito", "Venta eliminada correctamente");
        } catch (error) {
            await db.runAsync("ROLLBACK");
            console.log(error);
            Alert.alert("Error", "No se pudo eliminar la venta");
        }
    };

    // Formatear fecha (timestamp) a formato legible
    const formatFecha = (timestamp) => {
        if (!timestamp) return "Sin fecha";
        const date = new Date(timestamp);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    useEffect(() => {
        fetchVentas();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de Ventas</Text>
            <Button 
                title="Nueva Venta" 
                onPress={() => navigation.navigate('Venta')} 
            />
            
            <FlatList
                data={ventas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.total}>Total: ${item.total?.toFixed(2)}</Text>
                        <Text>Fecha: {formatFecha(item.fecha)}</Text>
                        
                        <Text style={styles.subtitle}>Productos:</Text>
                        {item.productos?.map(producto => (
                            <View key={producto.id} style={styles.productoItem}>
                                <Text>- {producto.nombre_producto}</Text>
                                <Text>  Cantidad: {producto.cantidad_vendida}</Text>
                                <Text>  Precio unitario: ${producto.precio_unitario?.toFixed(2)}</Text>
                                <Text>  Subtotal: ${(producto.cantidad_vendida * producto.precio_unitario)?.toFixed(2)}</Text>
                            </View>
                        ))}
                        
                        <Button
                            title="Eliminar Venta"
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
    title: { fontSize: 22, marginBottom: 15, fontWeight: 'bold', textAlign: 'center' },
    itemContainer: { 
        borderWidth: 1, 
        borderColor: '#ddd',
        borderRadius: 8, 
        padding: 15, 
        marginBottom: 15,
        backgroundColor: '#f9f9f9'
    },
    total: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    subtitle: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    productoItem: { 
        marginLeft: 10, 
        marginBottom: 5, 
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderLeftColor: '#ccc'
    },
});


export default ListaVentasScreen;