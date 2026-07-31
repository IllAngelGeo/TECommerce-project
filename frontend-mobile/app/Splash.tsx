import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Easing,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

interface SplashProps {
  onFinish?: () => void;
  duration?: number;
}

const COLORS = {
  background: "#000000",
  backgroundSecondary: "#0A0A0A",
  white: "#FFFFFF",
  gray: "#888888",
  darkGray: "#1A1A1A",
  lightGray: "#999999",
  glow: "rgba(255,255,255,0.03)",
};

export default function Splash({
  onFinish,
  duration = 3000,
}: SplashProps) {
  const [progress, setProgress] = useState(0);

  // === ANIMACIONES PRINCIPALES ===
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  // ¡AHORA EL TÍTULO EMPIEZA VISIBLE!
  const titleOpacity = useRef(new Animated.Value(1)).current; // <--- CAMBIADO a 1
  const titleTranslateY = useRef(new Animated.Value(0)).current; // <--- CAMBIADO a 0
  const titleScale = useRef(new Animated.Value(1)).current; // <--- CAMBIADO a 1

  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  const progressWidth = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  const particles = useRef(
    Array(6).fill(0).map(() => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  const borderGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // === PARTÍCULAS ANIMADAS ===
    const particleAnimations = particles.map((particle, index) => {
      const delay = index * 200;
      const angle = (index / particles.length) * Math.PI * 2;
      const distance = 120 + Math.random() * 60;

      return Animated.parallel([
        Animated.timing(particle.opacity, {
          toValue: 0.6,
          duration: 800,
          delay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(particle.scale, {
          toValue: 0.8 + Math.random() * 0.6,
          friction: 3,
          tension: 20,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateX, {
          toValue: Math.cos(angle) * distance,
          duration: 1500,
          delay,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: Math.sin(angle) * distance,
          duration: 1500,
          delay,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]);
    });

    // === ANIMACIÓN DE BRILLO PULSANTE ===
    const glowPulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // === ANIMACIÓN DE BORDE ===
    const borderAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(borderGlow, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(borderGlow, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // === SECUENCIA PRINCIPAL ===
    const mainSequence = Animated.sequence([
      // FASE 1: Logo explosion
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 2,
          tension: 30,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        ...particleAnimations,
      ]),
      
      // FASE 2: Barra de progreso
      Animated.parallel([
        Animated.timing(progressOpacity, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(progressWidth, {
          toValue: 100,
          duration: duration - 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ]);

    // === INICIAR ANIMACIONES ===
    Animated.parallel([
      mainSequence,
      glowPulseAnimation,
      borderAnimation,
    ]).start();

    // === SIMULAR PROGRESO ===
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 4 + 1;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
      }
      setProgress(Math.min(prog, 100));
    }, 80);

    // === TIMER PARA FINALIZAR ===
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      mainSequence.stop();
      glowPulseAnimation.stop();
      borderAnimation.stop();
    };
  }, [duration, onFinish]);

  // === INTERPOLACIONES ===
  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  const glowIntensity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const borderGlowIntensity = borderGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.2)'],
  });

  const progressPercent = progressWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* FONDO CON GRADIENTE */}
      <LinearGradient
        colors={[
          COLORS.background,
          COLORS.backgroundSecondary,
          COLORS.background,
        ]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* CÍRCULOS DECORATIVOS */}
      <View style={styles.decorativeCircles}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />
      </View>

      <View style={styles.content}>
        {/* BRILLO PRINCIPAL */}
        <Animated.View
          style={[
            styles.mainGlow,
            {
              opacity: glowIntensity,
              transform: [{ scale: logoScale }],
              borderColor: borderGlowIntensity,
            },
          ]}
        />

        {/* PARTÍCULAS */}
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.translateX },
                  { translateY: particle.translateY },
                  { scale: particle.scale },
                ],
              },
            ]}
          />
        ))}

        {/* LOGO CON ROTACIÓN */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [
                {
                  rotate: spin,
                },
              ],
            },
          ]}
        >
          <Animated.Image
            source={require("../assets/logo_tecommerce.png")}
            style={[
              styles.logo,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
            resizeMode="contain"
          />
        </Animated.View>

        {/* TÍTULO - AHORA SIEMPRE VISIBLE */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            <Text style={styles.titleWhite}>Te</Text>
            <Text style={styles.titleGray}>Commerce</Text>
          </Text>

          <View style={styles.subtitleContainer}>
            <View style={styles.subtitleLine} />
            <Text style={styles.subtitle}>
              ✦ Tu mejor opción ✦
            </Text>
            <View style={styles.subtitleLine} />
          </View>

          <View style={styles.divider} />
        </View>

        {/* BARRA DE PROGRESO ULTRA */}
        <Animated.View
          style={[
            styles.progressContainer,
            {
              opacity: progressOpacity,
            },
          ]}
        >
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progress,
                {
                  width: progressPercent,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.progressShimmer,
                {
                  left: progressPercent,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress)}%
          </Text>
        </Animated.View>

        {/* LOADER Y VERSIÓN */}
        <Animated.View
          style={[
            styles.footerContainer,
            {
              opacity: progressOpacity,
            },
          ]}
        >
          <View style={styles.loaderDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
          <Text style={styles.versionText}>
            v3.0.0 • Build 2024
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  decorativeCircles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  circle1: {
    width: 400,
    height: 400,
    top: -200,
    right: -150,
  },
  circle2: {
    width: 300,
    height: 300,
    bottom: -150,
    left: -120,
  },
  circle3: {
    width: 200,
    height: 200,
    top: '40%',
    right: -80,
  },
  circle4: {
    width: 250,
    height: 250,
    top: '20%',
    left: -100,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  mainGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.glow,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 80,
    borderWidth: 1,
  },

  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.white,
    opacity: 0,
  },

  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logo: {
    width: 150,
    height: 150,
  },

  // === TÍTULO - DEFINITIVAMENTE VISIBLE ===
  titleContainer: {
    alignItems: "center",
    marginTop: 20,
    backgroundColor: 'transparent', // Asegura que no haya fondo bloqueando
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    backgroundColor: 'transparent', // Fondo transparente
  },
  titleWhite: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    backgroundColor: 'transparent',
  },
  titleGray: {
    color: '#CCCCCC',
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    backgroundColor: 'transparent',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  subtitle: {
    color: '#888888',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '300',
    backgroundColor: 'transparent',
  },
  subtitleLine: {
    width: 20,
    height: 1,
    backgroundColor: '#888888',
    opacity: 0.3,
  },
  divider: {
    width: 40,
    height: 1.5,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    opacity: 0.15,
    borderRadius: 1,
  },

  progressContainer: {
    width: "70%",
    marginTop: 45,
    alignItems: 'center',
  },
  progressBackground: {
    width: "100%",
    height: 2,
    backgroundColor: COLORS.darkGray,
    borderRadius: 10,
    overflow: "hidden",
    position: 'relative',
  },
  progress: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  progressShimmer: {
    position: 'absolute',
    top: 0,
    width: 60,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ skewX: '-20deg' }],
    opacity: 0.5,
  },
  progressText: {
    color: COLORS.lightGray,
    fontSize: 11,
    marginTop: 10,
    letterSpacing: 1,
    fontWeight: '300',
  },

  footerContainer: {
    marginTop: 30,
    alignItems: 'center',
    gap: 12,
  },
  loaderDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  dot1: {
    opacity: 0.8,
    transform: [{ scale: 1.2 }],
  },
  dot2: {
    opacity: 0.4,
  },
  dot3: {
    opacity: 0.2,
  },
  versionText: {
    color: COLORS.lightGray,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '300',
    opacity: 0.4,
  },
});