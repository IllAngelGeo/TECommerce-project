import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { API_URL } from "../../constants/api_url";

type EstadoPedido = "pendiente" | "en_proceso" | "entregado";
type FiltroPedido = "todos" | EstadoPedido;

interface Pedido {
  id_pedido: string;
  id_usuario: string;
  id_direccion: string;
  metodo_pago: string;
  total: number;
  estado: EstadoPedido;
  fecha_creacion: string;
  detalles: [];
}

interface RespuestaActualizarEstado {
  mensaje: string;
  pedido: Pedido;
}

const COLORES = {
  fondo: "#050505",
  superficie: "#101010",
  superficieAlta: "#171717",
  borde: "rgba(255,255,255,0.08)",
  texto: "#FFFFFF",
  textoSecundario: "#A3A3A3",
  textoTenue: "#666666",
  pendiente: "#BDBDBD",
  pendienteSuave: "rgba(189,189,189,0.12)",
  proceso: "#F6BD60",
  procesoSuave: "rgba(246,189,96,0.14)",
  entregado: "#4CAF50",
  entregadoSuave: "rgba(76,175,80,0.14)",
  blanco: "#FFFFFF",
  negro: "#000000",
};

function formatearEstado(estado: EstadoPedido): string {
  switch (estado) {
    case "en_proceso":
      return "En proceso";
    case "entregado":
      return "Entregado";
    default:
      return "Pendiente";
  }
}

function obtenerColorEstado(estado: EstadoPedido) {
  switch (estado) {
    case "en_proceso":
      return {
        color: COLORES.proceso,
        fondo: COLORES.procesoSuave,
        icono: "cube-outline" as const,
      };

    case "entregado":
      return {
        color: COLORES.entregado,
        fondo: COLORES.entregadoSuave,
        icono: "checkmark-circle-outline" as const,
      };

    default:
      return {
        color: COLORES.pendiente,
        fondo: COLORES.pendienteSuave,
        icono: "time-outline" as const,
      };
  }
}

function obtenerSiguienteEstado(
  estado: EstadoPedido,
): EstadoPedido | null {
  switch (estado) {
    case "pendiente":
      return "en_proceso";
    case "en_proceso":
      return "entregado";
    case "entregado":
      return null;
  }
}

function formatearPrecio(valor: number): string {
  return `$${Number(valor || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatearFecha(fecha: string): string {
  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPedidosView() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [actualizandoId, setActualizandoId] = useState<string | null>(
    null,
  );
  const [filtro, setFiltro] = useState<FiltroPedido>("todos");

  const obtenerPedidos = useCallback(
    async (modo: "inicial" | "refrescar" = "inicial") => {
      try {
        if (modo === "inicial") {
          setCargando(true);
        } else {
          setRefrescando(true);
        }

        const response = await fetch(
          `${API_URL}/pedidos/admin/todos`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "No fue posible obtener los pedidos",
          );
        }

        setPedidos(Array.isArray(data) ? data : []);
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "No fue posible cargar los pedidos",
        );
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [],
  );

  useEffect(() => {
    void obtenerPedidos("inicial");
  }, [obtenerPedidos]);

  const actualizarEstadoPedido = async (
    pedido: Pedido,
    nuevoEstado: EstadoPedido,
  ) => {
    const accion =
      nuevoEstado === "en_proceso"
        ? "procesar este pedido"
        : "marcar este pedido como entregado";

    Alert.alert(
      "Confirmar cambio",
      `¿Deseas ${accion}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setActualizandoId(pedido.id_pedido);

              const response = await fetch(
                `${API_URL}/pedidos/admin/${pedido.id_pedido}/estado`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                  body: JSON.stringify({
                    estado: nuevoEstado,
                  }),
                },
              );

              const data =
                (await response.json()) as RespuestaActualizarEstado & {
                  error?: string;
                };

              if (!response.ok) {
                throw new Error(
                  data?.error ||
                    "No fue posible actualizar el estado",
                );
              }

              setPedidos((actuales) =>
                actuales.map((item) =>
                  item.id_pedido === pedido.id_pedido
                    ? data.pedido
                    : item,
                ),
              );

              Alert.alert(
                "Estado actualizado",
                `El pedido ahora está ${formatearEstado(
                  nuevoEstado,
                ).toLowerCase()}.`,
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "No fue posible actualizar el pedido",
              );
            } finally {
              setActualizandoId(null);
            }
          },
        },
      ],
    );
  };

  const estadisticas = useMemo(() => {
    return {
      total: pedidos.length,
      pendientes: pedidos.filter(
        (pedido) => pedido.estado === "pendiente",
      ).length,
      proceso: pedidos.filter(
        (pedido) => pedido.estado === "en_proceso",
      ).length,
      entregados: pedidos.filter(
        (pedido) => pedido.estado === "entregado",
      ).length,
    };
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    if (filtro === "todos") {
      return pedidos;
    }

    return pedidos.filter(
      (pedido) => pedido.estado === filtro,
    );
  }, [filtro, pedidos]);

  const filtros: Array<{
    id: FiltroPedido;
    etiqueta: string;
    cantidad: number;
  }> = [
    {
      id: "todos",
      etiqueta: "Todos",
      cantidad: estadisticas.total,
    },
    {
      id: "pendiente",
      etiqueta: "Pendientes",
      cantidad: estadisticas.pendientes,
    },
    {
      id: "en_proceso",
      etiqueta: "En proceso",
      cantidad: estadisticas.proceso,
    },
    {
      id: "entregado",
      etiqueta: "Entregados",
      cantidad: estadisticas.entregados,
    },
  ];

  const renderPedido = ({ item }: { item: Pedido }) => {
    const estiloEstado = obtenerColorEstado(item.estado);
    const siguienteEstado = obtenerSiguienteEstado(item.estado);
    const actualizando = actualizandoId === item.id_pedido;

    return (
      <View style={styles.cardPedido}>
        <View style={styles.cardHeader}>
          <View style={styles.numeroPedidoContainer}>
            <Text style={styles.numeroPedidoLabel}>PEDIDO</Text>
            <Text style={styles.numeroPedido}>
              #{item.id_pedido.slice(0, 8).toUpperCase()}
            </Text>
          </View>

          <View
            style={[
              styles.badgeEstado,
              { backgroundColor: estiloEstado.fondo },
            ]}
          >
            <Ionicons
              name={estiloEstado.icono}
              size={15}
              color={estiloEstado.color}
            />
            <Text
              style={[
                styles.badgeEstadoTexto,
                { color: estiloEstado.color },
              ]}
            >
              {formatearEstado(item.estado)}
            </Text>
          </View>
        </View>

        <View style={styles.divisor} />

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValor}>
              {formatearFecha(item.fecha_creacion)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Método de pago</Text>
            <Text style={styles.infoValor}>
              {item.metodo_pago || "No especificado"}
            </Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.infoLabel}>Total del pedido</Text>
            <Text style={styles.totalValor}>
              {formatearPrecio(item.total)}
            </Text>
          </View>

          <View style={styles.usuarioIcon}>
            <Ionicons
              name="person-outline"
              size={20}
              color={COLORES.textoSecundario}
            />
          </View>
        </View>

        {siguienteEstado ? (
          <Pressable
            disabled={actualizando}
            onPress={() =>
              void actualizarEstadoPedido(
                item,
                siguienteEstado,
              )
            }
            style={({ pressed }) => [
              styles.botonAccion,
              pressed && styles.botonPresionado,
              actualizando && styles.botonDeshabilitado,
            ]}
          >
            {actualizando ? (
              <ActivityIndicator
                size="small"
                color={COLORES.negro}
              />
            ) : (
              <>
                <Ionicons
                  name={
                    siguienteEstado === "en_proceso"
                      ? "cube-outline"
                      : "checkmark-circle-outline"
                  }
                  size={19}
                  color={COLORES.negro}
                />

                <Text style={styles.botonAccionTexto}>
                  {siguienteEstado === "en_proceso"
                    ? "Procesar pedido"
                    : "Marcar como entregado"}
                </Text>
              </>
            )}
          </Pressable>
        ) : (
          <View style={styles.finalizadoContainer}>
            <Ionicons
              name="checkmark-circle"
              size={19}
              color={COLORES.entregado}
            />
            <Text style={styles.finalizadoTexto}>
              Pedido completado
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORES.fondo}
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORES.blanco}
          />
          <Text style={styles.loadingTitulo}>
            Cargando pedidos
          </Text>
          <Text style={styles.loadingTexto}>
            Consultando pedidos del sistema…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORES.fondo}
      />

      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => item.id_pedido}
        renderItem={renderPedido}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContenido}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() =>
              void obtenerPedidos("refrescar")
            }
            tintColor={COLORES.blanco}
            colors={[COLORES.blanco]}
            progressBackgroundColor={COLORES.superficieAlta}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerEyebrow}>
                  PANEL ADMINISTRATIVO
                </Text>
                <Text style={styles.headerTitulo}>
                  Gestión de pedidos
                </Text>
                <Text style={styles.headerDescripcion}>
                  Supervisa y actualiza el estado de los envíos.
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  void obtenerPedidos("refrescar")
                }
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && styles.botonPresionado,
                ]}
              >
                {refrescando ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORES.blanco}
                  />
                ) : (
                  <Ionicons
                    name="refresh-outline"
                    size={22}
                    color={COLORES.blanco}
                  />
                )}
              </Pressable>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor:
                        COLORES.pendienteSuave,
                    },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={COLORES.pendiente}
                  />
                </View>
                <Text style={styles.statNumero}>
                  {estadisticas.pendientes}
                </Text>
                <Text style={styles.statLabel}>
                  Pendientes
                </Text>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor:
                        COLORES.procesoSuave,
                    },
                  ]}
                >
                  <Ionicons
                    name="cube-outline"
                    size={20}
                    color={COLORES.proceso}
                  />
                </View>
                <Text style={styles.statNumero}>
                  {estadisticas.proceso}
                </Text>
                <Text style={styles.statLabel}>
                  En proceso
                </Text>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor:
                        COLORES.entregadoSuave,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={COLORES.entregado}
                  />
                </View>
                <Text style={styles.statNumero}>
                  {estadisticas.entregados}
                </Text>
                <Text style={styles.statLabel}>
                  Entregados
                </Text>
              </View>
            </View>

            <View style={styles.filtrosContainer}>
              {filtros.map((item) => {
                const activo = filtro === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setFiltro(item.id)}
                    style={[
                      styles.filtroButton,
                      activo && styles.filtroButtonActivo,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filtroTexto,
                        activo && styles.filtroTextoActivo,
                      ]}
                    >
                      {item.etiqueta}
                    </Text>

                    <View
                      style={[
                        styles.filtroCantidad,
                        activo &&
                          styles.filtroCantidadActiva,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filtroCantidadTexto,
                          activo &&
                            styles.filtroCantidadTextoActivo,
                        ]}
                      >
                        {item.cantidad}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.resultadosTexto}>
              {pedidosFiltrados.length} pedidos encontrados
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={34}
                color={COLORES.textoTenue}
              />
            </View>
            <Text style={styles.emptyTitulo}>
              No hay pedidos
            </Text>
            <Text style={styles.emptyTexto}>
              No existen pedidos para el filtro seleccionado.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  listaContenido: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  loadingTitulo: {
    color: COLORES.texto,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 18,
  },
  loadingTexto: {
    color: COLORES.textoSecundario,
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  headerEyebrow: {
    color: COLORES.textoSecundario,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  headerTitulo: {
    color: COLORES.texto,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 5,
  },
  headerDescripcion: {
    color: COLORES.textoSecundario,
    fontSize: 13,
    marginTop: 7,
    maxWidth: 260,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    minHeight: 125,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  statIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statNumero: {
    color: COLORES.texto,
    fontSize: 25,
    fontWeight: "900",
  },
  statLabel: {
    color: COLORES.textoSecundario,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  filtrosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filtroButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  filtroButtonActivo: {
    backgroundColor: COLORES.blanco,
    borderColor: COLORES.blanco,
  },
  filtroTexto: {
    color: COLORES.textoSecundario,
    fontSize: 11,
    fontWeight: "700",
  },
  filtroTextoActivo: {
    color: COLORES.negro,
  },
  filtroCantidad: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORES.superficieAlta,
    marginLeft: 7,
    paddingHorizontal: 5,
  },
  filtroCantidadActiva: {
    backgroundColor: COLORES.negro,
  },
  filtroCantidadTexto: {
    color: COLORES.textoSecundario,
    fontSize: 9,
    fontWeight: "800",
  },
  filtroCantidadTextoActivo: {
    color: COLORES.blanco,
  },
  resultadosTexto: {
    color: COLORES.textoTenue,
    fontSize: 11,
    marginBottom: 12,
  },
  cardPedido: {
    width: "100%",
    padding: 17,
    borderRadius: 20,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  numeroPedidoContainer: {
    flex: 1,
    minWidth: 0,
  },
  numeroPedidoLabel: {
    color: COLORES.textoTenue,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  numeroPedido: {
    color: COLORES.texto,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 3,
  },
  badgeEstado: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    gap: 6,
  },
  badgeEstadoTexto: {
    fontSize: 10,
    fontWeight: "800",
  },
  divisor: {
    height: 1,
    backgroundColor: COLORES.borde,
    marginVertical: 15,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 14,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    color: COLORES.textoTenue,
    fontSize: 10,
  },
  infoValor: {
    color: COLORES.texto,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    textTransform: "capitalize",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },
  totalValor: {
    color: COLORES.texto,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 3,
  },
  usuarioIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORES.superficieAlta,
  },
  botonAccion: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    marginTop: 17,
    paddingHorizontal: 16,
  },
  botonAccionTexto: {
    color: COLORES.negro,
    fontSize: 13,
    fontWeight: "900",
  },
  botonPresionado: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
  botonDeshabilitado: {
    opacity: 0.65,
  },
  finalizadoContainer: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    backgroundColor: COLORES.entregadoSuave,
    marginTop: 17,
  },
  finalizadoTexto: {
    color: COLORES.entregado,
    fontSize: 13,
    fontWeight: "800",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  emptyTitulo: {
    color: COLORES.texto,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 16,
  },
  emptyTexto: {
    color: COLORES.textoSecundario,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 7,
  },
});