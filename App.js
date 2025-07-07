import { SQLiteProvider } from 'expo-sqlite';
import React from 'react';
import 'react-native-gesture-handler';

import Main from "./screen/Main";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';


import ProductosScreen from "./screen/ProductosScreen";
import ListaProductosScreen from './screen/ListaProductosScreen';
import CategoriaScreen from "./screen/CategoriaScreen";
import VentasScreen from "./screen/VentasScreen";
import ListaVentasScreen from "./screen/ListaVentasScreen";

const Drawer = createDrawerNavigator();

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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Drawer.Navigator
            initialRouteName="Main"
            screenOptions={{
              headerShown: true,
              drawerType: 'slide',
              // Puedes añadir estilos: drawerStyle: { width: 240 }
            }}
          >
            <Drawer.Screen name="Main" component={Main} options={{ drawerLabel: 'Principal' }} />
            <Drawer.Screen name="Productos" component={ProductosScreen} options={{ drawerLabel: 'Productos' }} />
            <Drawer.Screen name="ListaProductos" component={ListaProductosScreen} options={{ drawerLabel: 'Lista Productos' }} />
            <Drawer.Screen name="Categorias" component={CategoriaScreen} options={{ drawerLabel: 'Categorías' }} />
            <Drawer.Screen name="Ventas" component={VentasScreen} options={{ drawerLabel: 'Ventas' }} />
            <Drawer.Screen name="ListaVentas" component={ListaVentasScreen} options={{ drawerLabel: 'Lista Ventas' }} />
          </Drawer.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SQLiteProvider>
  );
}