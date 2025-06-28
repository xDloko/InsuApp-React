import { SQLiteProvider } from 'expo-sqlite';
import React from 'react';
import Main from "./screen/Main";

export default function App() {
  return (
    <SQLiteProvider
      databaseName="InsuApp.db"
      onInit={async (db)=>{
        await db.execAsync("PRAGMA  journal_mode= WAL;");
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
    options={{ useNewConnection: false}}
    >

    {/*aqui van las screen */}

    <Main /> 
    </SQLiteProvider> 
  );
}


