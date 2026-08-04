import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MenuLateral from "../../../components/MenuLateral";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api_url";

interface ResultadoIA {
  categoria_principal: string;
  productos: string[];
  productos_bajo_stock: number;
  recomendacion: string;
}

const COLORS = {
  background: "#050505",
  surface: "#101010",
  surfaceElevated: "#171717",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",

  primary: "#FFFFFF",
  primaryStrong: "#D8D8D8",
  primarySoft: "rgba(255,255,255,0.08)",

  text: "#FFFFFF",
  textMuted: "#B5B5B5",
  textSubtle: "#737373",

  warning: "#F6BD60",
  warningSoft: "rgba(246,189,96,0.14)",

  danger: "#FF6B6B",
  dangerSoft: "rgba(255,107,107,0.14)",

  success: "#4ECDC4",
  successSoft: "rgba(78,205,196,0.14)",

  category: "#82A9FF",
  categorySoft: "rgba(130,169,255,0.14)",
};

function MetricCard({
  icon,
  label,
  value,
  tone = "primary",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone?: "primary" | "warning" | "success" | "category";
}) {
  const toneMap = {
    primary: {
      color: COLORS.primary,
      backgroundColor: COLORS.primarySoft,
    },
    warning: {
      color: COLORS.warning,
      backgroundColor: COLORS.warningSoft,
    },
    success: {
      color: COLORS.success,
      backgroundColor: COLORS.successSoft,
    },
    category: {
      color: COLORS.category,
      backgroundColor: COLORS.categorySoft,
    },
  }[tone];

  return (
    <LinearGradient
      colors={[toneMap.backgroundColor, "rgba(255,255,255,0.018)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.metricCard, { borderColor: toneMap.color + "33" }]}
    >
      <View style={[styles.metricIcon, { backgroundColor: toneMap.backgroundColor }]}>
        <Ionicons name={icon} size={21} color={toneMap.color} />
      </View>

      <View style={[styles.metricAccent, { backgroundColor: toneMap.color }]} />

      <Text style={styles.metricValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.metricLabel} numberOfLines={2}>
        {label}
      </Text>
    </LinearGradient>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  badge,
  tone = "primary",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  badge?: string;
  tone?: "primary" | "warning" | "danger" | "category";
}) {
  const toneMap = {
    primary: { color: COLORS.primary, backgroundColor: COLORS.primarySoft },
    warning: { color: COLORS.warning, backgroundColor: COLORS.warningSoft },
    danger: { color: COLORS.danger, backgroundColor: COLORS.dangerSoft },
    category: { color: COLORS.category, backgroundColor: COLORS.categorySoft },
  }[tone];

  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: toneMap.backgroundColor }]}>
        <Ionicons name={icon} size={20} color={toneMap.color} />
      </View>

      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
      </View>

      {badge ? (
        <View style={[styles.sectionBadge, { backgroundColor: toneMap.backgroundColor }]}>
          <Text style={[styles.sectionBadgeText, { color: toneMap.color }]}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

function SkeletonCard({ width }: { width: number }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonTitle} />
      </View>
      <View style={styles.skeletonLineLarge} />
      <View style={styles.skeletonLine} />

      <Animated.View
        pointerEvents="none"
        style={[styles.shimmer, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.07)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export default function AsistenteIA() {
  const { width } = useWindowDimensions();

  // Breakpoints pensados para teléfono, tablet y escritorio.
  const isTablet = width >= 700;
  const isDesktop = width >= 1080;
  const isCompact = width < 390;
  const canUseHealthRow = width >= 540;
  const [menuVisible, setMenuVisible] = useState(false);
  const [resultado, setResultado] = useState<ResultadoIA | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(18)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const requestController = useRef<AbortController | null>(null);

  const animateEntrance = useCallback(() => {
    contentOpacity.setValue(0);
    contentTranslateY.setValue(18);

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(contentTranslateY, {
        toValue: 0,
        friction: 9,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentOpacity, contentTranslateY]);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
      requestController.current?.abort();
    };
  }, [pulse, rotate]);

  const analizarInventario = useCallback(
    async (modo: "initial" | "refresh" = "initial") => {
      requestController.current?.abort();
      const controller = new AbortController();
      requestController.current = controller;

      try {
        setError(null);

        if (modo === "initial") {
          setCargando(true);
        } else {
          setRefrescando(true);
        }

        const response = await fetch(`${API_URL}/ia/analizar-inventario`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`La API respondió con el estado ${response.status}.`);
        }

        const data = (await response.json()) as ResultadoIA;

        if (
          typeof data?.productos_bajo_stock !== "number" ||
          !Array.isArray(data?.productos) ||
          typeof data?.categoria_principal !== "string" ||
          typeof data?.recomendacion !== "string"
        ) {
          throw new Error("La respuesta del servidor no tiene el formato esperado.");
        }

        setResultado(data);
        setUltimaActualizacion(new Date());
        animateEntrance();
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        console.error("Error al analizar el inventario:", err);
        setError(
          err instanceof Error
            ? err.message
            : "No fue posible completar el análisis del inventario.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
          setRefrescando(false);
        }
      }
    },
    [animateEntrance],
  );

  useEffect(() => {
    void analizarInventario("initial");
  }, [analizarInventario]);

  const isHealthy = (resultado?.productos_bajo_stock ?? 0) === 0;
  const totalProductosCriticos = resultado?.productos.length ?? 0;

  const horaActualizacion = useMemo(() => {
    if (!ultimaActualizacion) return "Sin actualizar";

    return ultimaActualizacion.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [ultimaActualizacion]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.42],
  });

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <LinearGradient
        colors={["#111111", COLORS.background, "#020202"]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.ambientOrb,
          styles.ambientOrbTop,
          {
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }, { rotate: spin }],
          },
        ]}
      />
      <View pointerEvents="none" style={[styles.ambientOrb, styles.ambientOrbBottom]} />
      <View pointerEvents="none" style={styles.gridOverlay} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && styles.scrollContentTablet,
            isDesktop && styles.scrollContentDesktop,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => void analizarInventario("refresh")}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.surfaceElevated}
            />
          }
        >
            <View style={[styles.topBar, isCompact && styles.topBarCompact]}>

  <Pressable
    style={styles.menuButton}
    onPress={() => setMenuVisible(true)}
  >
    <Ionicons
      name="menu"
      size={28}
      color={COLORS.text}
    />
  </Pressable>


  <View style={styles.brandContainer}>
      

              <View style={styles.brandTextContainer}>
                <Text style={styles.screenTitle}>Asistente de inventario</Text>
              </View>
            </View>

            <View style={[styles.livePill, isCompact && styles.livePillCompact]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>IA activa</Text>
            </View>
          </View>

          <LinearGradient
            colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroDecoration} />

            <View style={[styles.heroContent, isTablet && styles.heroContentWide]}>
              <View style={[styles.heroCopy, isTablet && styles.heroCopyWide]}>
                <Text style={styles.heroLabel}>ANÁLISIS OPERATIVO</Text>
                <Text style={styles.heroTitle}>
                  Decisiones de inventario basadas en datos
                </Text>
                <Text style={styles.heroDescription}>
                  Detecta faltantes, identifica categorías estratégicas y recibe una recomendación accionable en segundos.
                </Text>
              </View>

              <View style={[styles.heroStatus, isTablet && styles.heroStatusWide]}>
                <View
                  style={[
                    styles.heroStatusIcon,
                    isTablet && styles.heroStatusIconWide,
                  ]}
                >
                  <Ionicons name="pulse" size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.heroStatusLabel}>Último análisis</Text>
                <Text style={styles.heroStatusValue}>{horaActualizacion}</Text>
              </View>
            </View>
          </LinearGradient>

          {cargando ? (
            <View style={styles.loadingSection}>
              <View style={styles.loadingHeader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <View>
                  <Text style={styles.loadingTitle}>Analizando inventario</Text>
                  <Text style={styles.loadingSubtitle}>
                    Procesando existencias y patrones de negocio…
                  </Text>
                </View>
              </View>

              <View style={[styles.skeletonGrid, isTablet && styles.skeletonGridWide]}>
                <View style={isTablet ? styles.skeletonHalf : styles.skeletonFull}>
                  <SkeletonCard width={isTablet ? width / 2 : width} />
                </View>
                <View style={isTablet ? styles.skeletonHalf : styles.skeletonFull}>
                  <SkeletonCard width={isTablet ? width / 2 : width} />
                </View>
              </View>
            </View>
          ) : error ? (
            <View style={styles.errorCard}>
              <View style={styles.errorIcon}>
                <Ionicons name="cloud-offline-outline" size={28} color={COLORS.danger} />
              </View>
              <Text style={styles.errorTitle}>No se pudo completar el análisis</Text>
              <Text style={styles.errorDescription}>{error}</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reintentar análisis de inventario"
                onPress={() => void analizarInventario("initial")}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Ionicons name="refresh" size={19} color="#050505" />
                <Text style={styles.retryButtonText}>Reintentar análisis</Text>
              </Pressable>
            </View>
          ) : resultado ? (
            <Animated.View
              style={{
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              }}
            >
              <View style={[styles.metricsGrid, isTablet && styles.metricsGridWide]}>
                <View style={[styles.metricItem, isTablet && styles.metricItemWide]}>
                  <MetricCard
                    icon={isHealthy ? "shield-checkmark-outline" : "warning-outline"}
                    label="Estado general"
                    value={isHealthy ? "Estable" : "Atención"}
                    tone={isHealthy ? "success" : "warning"}
                  />
                </View>

                <View style={[styles.metricItem, isTablet && styles.metricItemWide]}>
                  <MetricCard
                    icon="alert-circle-outline"
                    label="Bajo stock"
                    value={String(resultado.productos_bajo_stock)}
                    tone={resultado.productos_bajo_stock > 0 ? "warning" : "success"}
                  />
                </View>

                <View
                  style={[
                    styles.metricItem,
                    styles.metricItemLast,
                    isTablet && styles.metricItemWide,
                  ]}
                >
                  <MetricCard
                    icon="layers-outline"
                    label="Categoría líder"
                    value={resultado.categoria_principal || "Sin datos"}
                    tone="category"
                  />
                </View>
              </View>

              <View style={[styles.mainGrid, isDesktop && styles.mainGridWide]}>
                <View style={isDesktop ? styles.mainColumn : undefined}>
                  <View style={styles.panel}>
                    <SectionHeader
                      icon={isHealthy ? "checkmark-circle-outline" : "warning-outline"}
                      title="Salud del inventario"
                      description="Evaluación actual de disponibilidad"
                      tone={isHealthy ? "primary" : "warning"}
                      badge={isHealthy ? "ÓPTIMO" : "REVISAR"}
                    />

                    <View
                      style={[
                        styles.healthContent,
                        canUseHealthRow && styles.healthContentWide,
                      ]}
                    >
                      <View
                        style={[
                          styles.healthRing,
                          {
                            borderColor: isHealthy
                              ? COLORS.success
                              : COLORS.warning,
                            backgroundColor: isHealthy
                              ? COLORS.successSoft
                              : COLORS.warningSoft,
                          },
                        ]}
                      >
                        <Text style={styles.healthNumber}>
                          {resultado.productos_bajo_stock}
                        </Text>
                        <Text style={styles.healthNumberLabel}>críticos</Text>
                      </View>

                      <View
                        style={[
                          styles.healthCopy,
                          canUseHealthRow && styles.healthCopyWide,
                        ]}
                      >
                        <Text
                          style={[
                            styles.healthTitle,
                            canUseHealthRow && styles.healthTitleWide,
                          ]}
                        >
                          {isHealthy
                            ? "Inventario bajo control"
                            : "Se requiere atención operativa"}
                        </Text>
                        <Text
                          style={[
                            styles.healthDescription,
                            canUseHealthRow && styles.healthDescriptionWide,
                          ]}
                        >
                          {isHealthy
                            ? "No se detectaron productos por debajo del nivel mínimo de existencias."
                            : `Se identificaron ${resultado.productos_bajo_stock} productos con disponibilidad reducida.`}
                        </Text>

                        <View
                          style={[
                            styles.statusStrip,
                            canUseHealthRow && styles.statusStripWide,
                            {
                              backgroundColor: isHealthy
                                ? COLORS.successSoft
                                : COLORS.warningSoft,
                            },
                          ]}
                        >
                          <Ionicons
                            name={isHealthy ? "shield-checkmark" : "time-outline"}
                            size={17}
                            color={isHealthy ? COLORS.success : COLORS.warning}
                          />
                          <Text
                            style={[
                              styles.statusStripText,
                              { color: isHealthy ? COLORS.success : COLORS.warning },
                            ]}
                          >
                            {isHealthy
                              ? "Operación saludable"
                              : "Prioriza reposición de existencias"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {resultado.productos_bajo_stock > 0 ? (
                    <View style={styles.panel}>
                      <SectionHeader
                        icon="cube-outline"
                        title="Productos prioritarios"
                        description="Artículos que necesitan reposición"
                        badge={String(totalProductosCriticos)}
                        tone="danger"
                      />

                      <View style={styles.productList}>
                        {resultado.productos.map((producto, index) => (
                          <View key={`${producto}-${index}`} style={styles.productRow}>
                            <View style={styles.productIndex}>
                              <Text style={styles.productIndexText}>
                                {String(index + 1).padStart(2, "0")}
                              </Text>
                            </View>

                            <View style={styles.productInfo}>
                              <Text style={styles.productName}>{producto}</Text>
                              <Text style={styles.productStatus}>Existencia reducida</Text>
                            </View>

                            <View style={styles.productAlertIcon}>
                              <Ionicons
                                name="arrow-down-outline"
                                size={18}
                                color={COLORS.danger}
                              />
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </View>

                <View style={isDesktop ? styles.mainColumn : undefined}>
                  <View style={styles.panel}>
                    <SectionHeader
                      icon="analytics-outline"
                      title="Categoría estratégica"
                      description="Mayor concentración de productos"
                      badge="TOP 1"
                      tone="category"
                    />

                    <LinearGradient
                      colors={["rgba(130,169,255,0.15)", "rgba(130,169,255,0.03)"]}
                      style={styles.categorySpotlight}
                    >
                      <View style={styles.categorySpotlightIcon}>
                        <Ionicons name="podium-outline" size={25} color={COLORS.category} />
                      </View>
                      <Text style={styles.categoryName}>
                        {resultado.categoria_principal || "Sin categoría"}
                      </Text>
                      <Text style={styles.categoryCaption}>
                        Esta categoría representa actualmente la mayor presencia dentro del inventario registrado.
                      </Text>
                    </LinearGradient>
                  </View>

                  <View style={styles.panel}>
                    <SectionHeader
                      icon="bulb-outline"
                      title="Recomendación inteligente"
                      description="Siguiente acción sugerida por el modelo"
                      tone="warning"
                    />

                    <View style={styles.recommendationBox}>
                      <View style={styles.quoteMark}>
                        <Ionicons name="chatbox-ellipses-outline" size={22} color={COLORS.warning} />
                      </View>
                      <Text style={styles.recommendationText}>
                        {resultado.recomendacion}
                      </Text>
                    </View>

                    <View style={styles.aiFooter}>
                      <View style={styles.aiFooterLeft}>
                        <Ionicons name="sparkles-outline" size={15} color={COLORS.primary} />
                        <Text style={styles.aiFooterText}>Generado mediante análisis IA</Text>
                      </View>
                      <Text style={styles.aiFooterTime}>{horaActualizacion}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Volver a analizar el inventario"
                disabled={refrescando}
                onPress={() => void analizarInventario("refresh")}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                  refrescando && styles.buttonDisabled,
                ]}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryStrong]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  {refrescando ? (
                    <ActivityIndicator size="small" color="#050505" />
                  ) : (
                    <Ionicons name="refresh" size={20} color="#050505" />
                  )}
                  <Text style={styles.primaryButtonText}>
                    {refrescando ? "Actualizando análisis…" : "Ejecutar nuevo análisis"}
                  </Text>
                  {!refrescando ? (
                    <Ionicons name="arrow-forward" size={19} color="#050505" />
                  ) : null}
                </LinearGradient>
              </Pressable>

              <Text style={styles.disclaimer}>
                Las recomendaciones se generan con los datos disponibles en el sistema y deben validarse antes de ejecutar acciones comerciales.
              </Text>
            </Animated.View>
          ) : null}
        </ScrollView>
      </SafeAreaView>


<MenuLateral
  visible={menuVisible}
  onClose={() => setMenuVisible(false)}
  seccionActual="dashboard"
/>


</View>
 );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.025,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  ambientOrb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  ambientOrbTop: {
    width: 300,
    height: 300,
    top: -130,
    right: -120,
  },
  ambientOrbBottom: {
    width: 220,
    height: 220,
    bottom: 80,
    left: -170,
    opacity: 0.08,
  },
scrollContent: {
  paddingHorizontal: 18,
  paddingTop: Platform.OS === "android" ? 40 : 25,
  paddingBottom: 44,
},

  scrollContentTablet: {
    paddingHorizontal: 24,
  },
  scrollContentDesktop: {
    maxWidth: 1240,
    alignSelf: "center",
    paddingHorizontal: 32,
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },
  topBarCompact: {
    alignItems: "flex-start",
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  brandTextContainer: {
    marginLeft: 13,
    flexShrink: 1,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "700",
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    marginLeft: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  livePillCompact: {
    paddingHorizontal: 9,
    marginLeft: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 7,
  },
  liveText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  heroCard: {
    width: "100%",
    borderRadius: 26,
    padding: 20,
    marginBottom: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  heroDecoration: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    top: -85,
    right: -45,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  heroContent: {
    width: "100%",
  },
  heroContentWide: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  heroCopy: {
    width: "100%",
  },
  heroCopyWide: {
    flex: 1,
    minWidth: 0,
    paddingRight: 24,
  },
  heroLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  heroDescription: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 620,
  },
  heroStatus: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  heroStatusWide: {
    width: "auto",
    minWidth: 120,
    flexDirection: "column",
    alignItems: "flex-end",
    marginTop: 0,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  heroStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    marginRight: 12,
  },
  heroStatusIconWide: {
    marginRight: 0,
    marginBottom: 10,
  },
  heroStatusLabel: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "600",
  },
  heroStatusValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
    marginLeft: 15,
  },
  loadingSection: {
    marginTop: 4,
  },
  loadingHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    gap: 12,
  },
  loadingTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  loadingSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  skeletonGrid: {
    gap: 14,
  },
  skeletonGridWide: {
    flexDirection: "row",
  },
  skeletonFull: {
    width: "100%",
  },
  skeletonHalf: {
    flex: 1,
  },
  skeletonCard: {
    height: 180,
    borderRadius: 22,
    padding: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  skeletonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.surfaceElevated,
  },
  skeletonTitle: {
    height: 14,
    width: "48%",
    borderRadius: 7,
    backgroundColor: COLORS.surfaceElevated,
  },
  skeletonLineLarge: {
    height: 38,
    width: "34%",
    borderRadius: 10,
    backgroundColor: COLORS.surfaceElevated,
    marginTop: 26,
  },
  skeletonLine: {
    height: 11,
    width: "72%",
    borderRadius: 6,
    backgroundColor: COLORS.surfaceElevated,
    marginTop: 16,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: "55%",
  },
  errorCard: {
    alignItems: "center",
    padding: 26,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(255,125,134,0.2)",
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerSoft,
    marginBottom: 16,
  },
  errorTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  errorDescription: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 470,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 20,
    paddingHorizontal: 19,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  retryButtonText: {
    color: "#050505",
    fontSize: 14,
    fontWeight: "800",
  },
  metricsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 8,
  },
  metricsGridWide: {
    flexWrap: "nowrap",
  },
  metricItem: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  metricItemLast: {
    width: "100%",
  },
  metricItemWide: {
    width: "33.333%",
  },
  metricCard: {
    width: "100%",
    minHeight: 138,
    padding: 17,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricAccent: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 18,
    right: 18,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  mainGrid: {
    width: "100%",
  },
  mainGridWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
  },
  panel: {
    width: "100%",
    padding: 18,
    borderRadius: 23,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 19,
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitleContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
    flexShrink: 1,
  },
  sectionDescription: {
    color: COLORS.textSubtle,
    fontSize: 11,
    marginTop: 3,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sectionBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  healthContent: {
    width: "100%",
    alignItems: "center",
  },
  healthContentWide: {
    flexDirection: "row",
    alignItems: "center",
  },
  healthRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  healthNumber: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
  },
  healthNumberLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  healthCopy: {
    width: "100%",
    marginTop: 18,
    alignItems: "center",
  },
  healthCopyWide: {
    flex: 1,
    minWidth: 0,
    width: "auto",
    marginTop: 0,
    marginLeft: 20,
    alignItems: "flex-start",
  },
  healthTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center",
  },
  healthTitleWide: {
    textAlign: "left",
  },
  healthDescription: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: "center",
  },
  healthDescriptionWide: {
    textAlign: "left",
  },
  statusStrip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 7,
    marginTop: 13,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  statusStripWide: {
    alignSelf: "flex-start",
  },
  statusStripText: {
    fontSize: 10,
    fontWeight: "700",
  },
  productList: {
    gap: 9,
  },
  productRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.025)",
    borderWidth: 1,
    borderColor: "rgba(255,125,134,0.10)",
  },
  productIndex: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerSoft,
  },
  productIndexText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "800",
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    marginRight: 8,
  },
  productName: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    flexShrink: 1,
  },
  productStatus: {
    color: COLORS.textSubtle,
    fontSize: 10,
    marginTop: 3,
  },
  productAlertIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerSoft,
  },
  categorySpotlight: {
    alignItems: "center",
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  categorySpotlightIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.categorySoft,
    marginBottom: 13,
  },
  categoryName: {
    color: COLORS.category,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
    textAlign: "center",
  },
  categoryCaption: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 360,
  },
  recommendationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 17,
    backgroundColor: COLORS.warningSoft,
    borderWidth: 1,
    borderColor: "rgba(247,199,107,0.15)",
  },
  quoteMark: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(247,199,107,0.10)",
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  aiFooter: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
    rowGap: 6,
  },
  aiFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiFooterText: {
    color: COLORS.textSubtle,
    fontSize: 10,
  },
  aiFooterTime: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "600",
  },
  primaryButton: {
    width: "100%",
    borderRadius: 17,
    overflow: "hidden",
    marginTop: 4,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 18,
    elevation: 8,
  },
  primaryButtonGradient: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#050505",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.1,
  },
  buttonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  disclaimer: {
    color: COLORS.textSubtle,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 14,
    paddingHorizontal: 14,
  },

  menuButton: {
    width: 45,
    height: 45,
    flexShrink: 0,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

});