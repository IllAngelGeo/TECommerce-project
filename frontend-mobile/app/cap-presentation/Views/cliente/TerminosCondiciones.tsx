import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const TERMINOS_STORAGE_KEY =
  "@tecommerce/terminos_condiciones_aceptados_v1";

// true: en Expo Go aparecerá cada vez que abras la aplicación.
// false: también se recordará la aceptación durante el desarrollo.
const MOSTRAR_SIEMPRE_EN_DESARROLLO = true;

interface TerminosCondicionesModalProps {
  onAccepted?: () => void;
}

export default function TerminosCondicionesModal({
  onAccepted,
}: TerminosCondicionesModalProps) {
  const [visible, setVisible] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [aceptando, setAceptando] = useState(false);

  useEffect(() => {
    void verificarAceptacion();
  }, []);

  const verificarAceptacion = async () => {
    try {
      /*
       * En Expo Go y durante desarrollo:
       * muestra el modal cada vez que el componente se monta.
       */
      if (__DEV__ && MOSTRAR_SIEMPRE_EN_DESARROLLO) {
        setVisible(true);
        return;
      }

      const aceptados = await AsyncStorage.getItem(
        TERMINOS_STORAGE_KEY,
      );

      setVisible(aceptados !== "true");
    } catch (error) {
      console.error(
        "Error verificando términos y condiciones:",
        error,
      );

      // Ante un error, se muestran para no asumir aceptación.
      setVisible(true);
    } finally {
      setVerificando(false);
    }
  };

  const aceptarTerminos = async () => {
    try {
      setAceptando(true);

      /*
       * En producción guardamos la aceptación.
       * Durante pruebas configuradas para mostrarse siempre,
       * no es necesario guardarla.
       */
      if (!__DEV__ || !MOSTRAR_SIEMPRE_EN_DESARROLLO) {
        await AsyncStorage.setItem(
          TERMINOS_STORAGE_KEY,
          "true",
        );
      }

      setVisible(false);
      onAccepted?.();
    } catch (error) {
      console.error(
        "Error guardando aceptación de términos:",
        error,
      );
    } finally {
      setAceptando(false);
    }
  };

  if (verificando) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={() => {
        // No se cierra con el botón atrás hasta aceptar.
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="document-text-outline"
                size={25}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.title}>
                Términos y condiciones
              </Text>

              <Text style={styles.subtitle}>
                Lee esta información antes de continuar
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
            <Text style={styles.sectionTitle}>
              1. Aceptación de los términos
            </Text>

            <Text style={styles.paragraph}>
              Al utilizar TeCommerce, la persona usuaria
              acepta estos términos y condiciones. Si no está
              de acuerdo, deberá dejar de utilizar la
              aplicación.
            </Text>

            <Text style={styles.sectionTitle}>
              2. Uso de la aplicación
            </Text>

            <Text style={styles.paragraph}>
              La aplicación permite consultar productos,
              administrar una cuenta, guardar direcciones,
              realizar pedidos y consultar su estado. La
              persona usuaria se compromete a proporcionar
              información verdadera y actualizada.
            </Text>

            <Text style={styles.sectionTitle}>
              3. Cuenta y seguridad
            </Text>

            <Text style={styles.paragraph}>
              La persona usuaria es responsable de mantener
              protegidos sus datos de acceso y de las
              actividades realizadas desde su cuenta. Debe
              informar cualquier uso no autorizado.
            </Text>

            <Text style={styles.sectionTitle}>
              4. Productos, precios y disponibilidad
            </Text>

            <Text style={styles.paragraph}>
              Los precios, promociones, imágenes y
              disponibilidad pueden cambiar. La confirmación
              definitiva de una compra depende de la
              disponibilidad del producto y de la validación
              del pedido.
            </Text>

            <Text style={styles.sectionTitle}>
              5. Pedidos y estado del envío
            </Text>

            <Text style={styles.paragraph}>
              Los pedidos podrán aparecer como pendientes, en
              proceso o entregados. El estado mostrado en la
              aplicación se actualizará conforme el
              administrador procese la orden.
            </Text>

            <Text style={styles.sectionTitle}>
              6. Pagos
            </Text>

            <Text style={styles.paragraph}>
              Los pagos pueden realizarse mediante los métodos
              habilitados en la aplicación. Cada proveedor de
              pago puede aplicar sus propios términos,
              condiciones y medidas de seguridad.
            </Text>

            <Text style={styles.sectionTitle}>
              7. Cancelaciones y devoluciones
            </Text>

            <Text style={styles.paragraph}>
              Las solicitudes de cancelación, devolución o
              reembolso estarán sujetas a la política comercial
              de TeCommerce y a las condiciones aplicables al
              producto adquirido.
            </Text>

            <Text style={styles.sectionTitle}>
              8. Privacidad
            </Text>

            <Text style={styles.paragraph}>
              La aplicación puede tratar información necesaria
              para crear la cuenta, procesar pedidos, gestionar
              direcciones y brindar atención. El tratamiento de
              datos deberá explicarse en el aviso de privacidad
              correspondiente.
            </Text>

            <Text style={styles.sectionTitle}>
              9. Limitación de responsabilidad
            </Text>

            <Text style={styles.paragraph}>
              TeCommerce procurará mantener la aplicación
              disponible y actualizada, pero no garantiza que
              funcione sin interrupciones, errores técnicos o
              problemas derivados de servicios externos.
            </Text>

            <Text style={styles.sectionTitle}>
              10. Modificaciones
            </Text>

            <Text style={styles.paragraph}>
              Estos términos pueden actualizarse cuando sea
              necesario. Si existe un cambio importante, la
              aplicación podrá solicitar nuevamente la
              aceptación.
            </Text>

            <Text style={styles.lastUpdate}>
              Última actualización: agosto de 2026
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.acceptanceText}>
              Al continuar, confirmas que leíste y aceptas los
              términos y condiciones.
            </Text>

            <Pressable
              disabled={aceptando}
              onPress={() => void aceptarTerminos()}
              style={({ pressed }) => [
                styles.acceptButton,
                pressed && styles.acceptButtonPressed,
                aceptando && styles.acceptButtonDisabled,
              ]}
            >
              {aceptando ? (
                <ActivityIndicator
                  size="small"
                  color="#000000"
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="#000000"
                  />

                  <Text style={styles.acceptButtonText}>
                    Aceptar y continuar
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 35,
    backgroundColor: "rgba(0,0,0,0.88)",
  },
  modal: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "90%",
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#101010",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B1B1B",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  headerText: {
    flex: 1,
    marginLeft: 13,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "#777777",
    fontSize: 11,
    marginTop: 4,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 19,
    paddingBottom: 25,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 15,
    marginBottom: 7,
  },
  paragraph: {
    color: "#A5A5A5",
    fontSize: 12,
    lineHeight: 19,
  },
  lastUpdate: {
    color: "#666666",
    fontSize: 11,
    textAlign: "center",
    marginTop: 25,
  },
  footer: {
    padding: 17,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0C0C0C",
  },
  acceptanceText: {
    color: "#777777",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginBottom: 12,
  },
  acceptButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
  },
  acceptButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "900",
  },
  acceptButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  acceptButtonDisabled: {
    opacity: 0.65,
  },
});