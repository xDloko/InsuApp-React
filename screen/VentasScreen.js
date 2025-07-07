import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Button, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

const VentaScreen = ({ navigation }) => {
    const db = useSQLiteContext();
    const [productos, setProductos] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    // Obtener todos los productos disponibles
    const fetchProductos = async () => {
        try {
            const results = await db.getAllAsync(
                `SELECT id, nombre, precio, stock FROM productos WHERE nombre LIKE ?`,
                [`%${busqueda}%`]
            );
            setProductos(results);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudieron cargar los productos");
        }
    };

    // Buscar productos cuando cambia el texto de búsqueda
    useEffect(() => {
        fetchProductos();
    }, [busqueda]);

    // Agregar producto a la venta
    const agregarProducto = (producto) => {
        const existente = productosSeleccionados.find(p => p.id === producto.id);
        
        if (existente) {
            // Si ya está en la lista, aumentar cantidad
            if (existente.cantidad < producto.stock) {
                setProductosSeleccionados(
                    productosSeleccionados.map(p =>
                        p.id === producto.id 
                            ? { ...p, cantidad: p.cantidad + 1 } 
                            : p
                    )
                );
            } else {
                Alert.alert("Stock insuficiente", "No hay suficiente stock disponible");
            }
        } else {
            // Si no está en la lista, agregarlo con cantidad 1
            if (producto.stock > 0) {
                setProductosSeleccionados([
                    ...productosSeleccionados,
                    { ...producto, cantidad: 1 }
                ]);
            } else {
                Alert.alert("Sin stock", "Este producto no tiene stock disponible");
            }
        }
    };

    // Eliminar producto de la venta
    const eliminarProducto = (id) => {
        setProductosSeleccionados(
            productosSeleccionados.filter(p => p.id !== id)
        );
    };

    // Actualizar cantidad de un producto
    const actualizarCantidad = (id, nuevaCantidad) => {
        const producto = productosSeleccionados.find(p => p.id === id);
        
        if (nuevaCantidad <= 0) {
            eliminarProducto(id);
            return;
        }

        if (nuevaCantidad > producto.stock) {
            Alert.alert("Stock insuficiente", "No hay suficiente stock disponible");
            return;
        }

        setProductosSeleccionados(
            productosSeleccionados.map(p =>
                p.id === id ? { ...p, cantidad: nuevaCantidad } : p
            )
        );
    };

    // Calcular total de la venta
    const calcularTotal = () => {
        return productosSeleccionados.reduce(
            (total, producto) => total + (producto.precio * producto.cantidad),
            0
        ).toFixed(2);
    };

    // Finalizar la venta
    const finalizarVenta = async () => {
        if (productosSeleccionados.length === 0) {
            Alert.alert("Error", "Debes agregar al menos un producto");
            return;
        }

        try {
            await db.runAsync("BEGIN TRANSACTION");

            // 1. Insertar la venta
            const fecha = new Date().getTime(); // Timestamp actual
            const total = calcularTotal();
            
            const { lastInsertRowId } = await db.runAsync(
                "INSERT INTO venta (total, fecha) VALUES (?, ?)",
                [total, fecha]
            );

            // 2. Insertar los productos de la venta
            for (const producto of productosSeleccionados) {
                await db.runAsync(
                    `INSERT INTO productos_venta 
                     (id_producto, id_venta, cantidad_vendida, precio_unitario) 
                     VALUES (?, ?, ?, ?)`,
                    [producto.id, lastInsertRowId, producto.cantidad, producto.precio]
                );

                // 3. Actualizar el stock de los productos
                await db.runAsync(
                    "UPDATE productos SET stock = stock - ? WHERE id = ?",
                    [producto.cantidad, producto.id]
                );
            }

            await db.runAsync("COMMIT");
            Alert.alert("Éxito", "Venta registrada correctamente");
            navigation.goBack();
        } catch (error) {
            await db.runAsync("ROLLBACK");
            console.error(error);
            Alert.alert("Error", "No se pudo completar la venta");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Nueva Venta</Text>
            
            {/* Buscador de productos */}
            <TextInput
                style={styles.buscador}
                placeholder="Buscar productos..."
                value={busqueda}
                onChangeText={setBusqueda}
            />
            
            {/* Lista de productos disponibles */}
            <Text style={styles.subtitle}>Productos Disponibles</Text>
            <FlatList
                data={productos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.productoItem} 
                        onPress={() => agregarProducto(item)}
                        disabled={item.stock <= 0}
                    >
                        <Text style={styles.productoNombre}>{item.nombre}</Text>
                        <Text>Precio: ${item.precio?.toFixed(2)}</Text>
                        <Text>Stock: {item.stock}</Text>
                        {item.stock <= 0 && <Text style={styles.sinStock}>SIN STOCK</Text>}
                    </TouchableOpacity>
                )}
                style={styles.listaProductos}
            />
            
            {/* Productos seleccionados */}
            <Text style={styles.subtitle}>Productos en la Venta</Text>
            {productosSeleccionados.length === 0 ? (
                <Text style={styles.sinProductos}>No hay productos agregados</Text>
            ) : (
                <FlatList
                    data={productosSeleccionados}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.productoSeleccionado}>
                            <View style={styles.productoInfo}>
                                <Text style={styles.productoNombre}>{item.nombre}</Text>
                                <Text>${item.precio?.toFixed(2)} x {item.cantidad} = ${(item.precio * item.cantidad).toFixed(2)}</Text>
                            </View>
                            <View style={styles.cantidadContainer}>
                                <Button
                                    title="-"
                                    onPress={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                />
                                <Text style={styles.cantidadText}>{item.cantidad}</Text>
                                <Button
                                    title="+"
                                    onPress={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                />
                                <Button
                                    title="✕"
                                    onPress={() => eliminarProducto(item.id)}
                                    color="red"
                                />
                            </View>
                        </View>
                    )}
                />
            )}
            
            {/* Total y botón de finalizar */}
            <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total: ${calcularTotal()}</Text>
                <Button
                    title="Finalizar Venta"
                    onPress={finalizarVenta}
                    color="green"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    buscador: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    listaProductos: {
        maxHeight: 200,
        marginBottom: 20,
    },
    productoItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    productoNombre: {
        fontWeight: 'bold',
    },
    sinStock: {
        color: 'red',
        fontStyle: 'italic',
    },
    productoSeleccionado: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    productoInfo: {
        flex: 1,
    },
    cantidadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cantidadText: {
        marginHorizontal: 10,
        fontSize: 16,
    },
    sinProductos: {
        textAlign: 'center',
        fontStyle: 'italic',
        marginVertical: 20,
    },
    totalContainer: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 50,
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default VentaScreen;