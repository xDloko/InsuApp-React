import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Button, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { useSQLiteContext } from 'expo-sqlite';

export default function Main() {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24*60*60*1000)); // hace 30 días
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [monthlySales, setMonthlySales] = useState([]);
  const [productStats, setProductStats] = useState([]);

  const loadStats = async () => {
    setLoading(true);
    const startTs = Math.floor(startDate.getTime());
    const endTs = Math.floor(endDate.getTime());
    try {
      const ventas = await db.getAllAsync(`
        SELECT strftime('%Y-%m-%d', fecha/1000, 'unixepoch') AS dia, SUM(total) AS total
        FROM venta
        WHERE fecha BETWEEN ${startTs} AND ${endTs}
        GROUP BY dia ORDER BY dia;
      `);
      setMonthlySales(ventas.map(r => ({ value: r.total, label: r.dia.slice(5) })));

      const productos = await db.getAllAsync(`
        SELECT p.nombre AS name, SUM(pv.cantidad_vendida) AS qty
        FROM productos_venta pv
        JOIN venta v ON pv.id_venta = v.id
        JOIN productos p ON pv.id_producto = p.id
        WHERE v.fecha BETWEEN ${startTs} AND ${endTs}
        GROUP BY pv.id_producto
        ORDER BY qty DESC LIMIT 5;
      `);
      setProductStats(productos.map(r => ({ value: r.qty, label: r.name })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (db) loadStats();
  }, [db]);

  if (loading) {
    return <View style={{ flex:1, justifyContent:'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {/* Filtros de fecha */}
      <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom: 20 }}>
        <View>
          <Button title={`Desde: ${startDate.toISOString().slice(0,10)}`} onPress={() => setShowStart(true)} />
          {showStart && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowStart(false);
                if (date) setStartDate(date);
              }}
            />
          )}
        </View>
        <View>
          <Button title={`Hasta: ${endDate.toISOString().slice(0,10)}`} onPress={() => setShowEnd(true)} />
          {showEnd && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowEnd(false);
                if (date) setEndDate(date);
              }}
            />
          )}
        </View>
        <Button title="Actualizar" onPress={loadStats} />
      </View>

      {/* Gráficos */}
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Ventas por día</Text>
      <BarChart data={monthlySales} barWidth={20} spacing={20} showTooltip />

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Productos más vendidos</Text>
      <PieChart data={productStats} donut showText />
    </ScrollView>
  );
}
