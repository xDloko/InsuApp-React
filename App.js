import { SQLiteProvider } from 'expo-sqlite';
import React from 'react';
import 'react-native-gesture-handler';

import Main from "./screen/Main";
import ProductosScreen from "./screen/ProductosScreen";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListaProductosScreen from './screen/ListaProductosScreen';
import CategoriaScreen from "./screen/CategoriaScreen";
import VentasScreen from "./screen/VentasScreen";
import ListaVentasScreen from "./screen/ListaVentasScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SQLiteProvider
      databaseName="InsuApp.db"
      onInit={async (db) => {
        await db.execAsync("PRAGMA journal_mode= WAL;");
        await db.execAsync(
          `
          CREATE TABLE IF NOT EXISTS categoria( 
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_categoria TEXT NOT NULL,
            descripcion_categoria TEXT
          );
          
          CREATE TABLE IF NOT EXISTS productos(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            precio REAL,
            stock INTEGER,
            id_categoria INTEGER,
            FOREIGN KEY (id_categoria) REFERENCES categoria(id)
          );

          CREATE TABLE IF NOT EXISTS venta (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total REAL,
            fecha INTEGER
          );

          CREATE TABLE IF NOT EXISTS productos_venta(
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            cantidad_vendida INTEGER,
            id_producto INTEGER,
            id_venta INTEGER,
            precio_unitario REAL,
            FOREIGN KEY (id_producto) REFERENCES productos(id),
            FOREIGN KEY (id_venta) REFERENCES venta(id)
          );        
          `
        );
      }}
      options={{ useNewConnection: false }}
    >
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Main">
          <Stack.Screen name="Main" component={Main} options={{ title: 'Menú Principal' }} />
          <Stack.Screen name="Productos" component={ProductosScreen} options={{ title: 'Productos' }} />
          <Stack.Screen name="ListaProductos" component={ListaProductosScreen} options={{ title: 'Lista de Productos' }} />
          <Stack.Screen name="Categorias" component={CategoriaScreen} options={{ title: 'Categorías' }} />
          <Stack.Screen name="Venta" component={VentasScreen} options={{ title: 'Ventas' }} />
          <Stack.Screen name="ListaVentas" component={ListaVentasScreen} options={{ title: 'ListaVentas' }} />
          {/* Aquí puedes agregar más screens (ventas, etc.) */}
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}