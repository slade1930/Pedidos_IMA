// src/types/common.types.ts

// ─── TIPOS DE UTILIDAD ─────────────────────────────────────

/**
 * Hace que todas las propiedades de T sean opcionales en profundidad.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Hace que una propiedad específica sea requerida.
 */
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Hace que una propiedad específica sea opcional.
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extrae el tipo de los elementos de un array.
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Tipo para valores que pueden ser null o undefined.
 */
export type Nullable<T> = T | null | undefined;

/**
 * Tipo para valores que pueden ser undefined.
 */
export type Optional<T> = T | undefined;

// ─── OPCIONES ──────────────────────────────────────────────

/**
 * Opción genérica para selects y dropdowns.
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Opción con ícono para selects visuales.
 */
export interface SelectOptionWithIcon<T = string> extends SelectOption<T> {
  icon?: string;
  description?: string;
}

// ─── DIRECCIONES Y UBICACIONES ─────────────────────────────

/**
 * Coordenadas geográficas.
 */
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Dirección física.
 */
export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  zip_code?: string;
  coordinates?: GeoCoordinates;
}

// ─── ARCHIVOS Y MEDIA ──────────────────────────────────────

/**
 * Estado de carga de un archivo.
 */
export type UploadStatus = "idle" | "uploading" | "success" | "error";

/**
 * Información de un archivo subido.
 */
export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  status: UploadStatus;
  progress: number;
}

/**
 * Dimensiones de una imagen.
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

// ─── FECHAS Y HORARIOS ─────────────────────────────────────

/**
 * Rango de fechas.
 */
export interface DateRange {
  start_date: string;
  end_date: string;
}

/**
 * Período de tiempo para filtros.
 */
export type TimePeriod = "today" | "yesterday" | "this_week" | "this_month" | "this_year" | "custom";

// ─── ESTADO DE COMPONENTES ─────────────────────────────────

/**
 * Estados comunes de carga/error para componentes.
 */
export type AsyncState = "idle" | "loading" | "success" | "error";

/**
 * Props comunes para componentes con estado asíncrono.
 */
export interface AsyncStateProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// ─── MODALES Y DIÁLOGOS ────────────────────────────────────

/**
 * Tamaños de modal.
 */
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

/**
 * Props comunes para modales.
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── NOTIFICACIONES ────────────────────────────────────────

/**
 * Tipos de notificación.
 */
export type NotificationType = "success" | "error" | "warning" | "info";

/**
 * Notificación completa.
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

// ─── TABLAS ────────────────────────────────────────────────

/**
 * Configuración de columna para DataTable.
 */
export interface ColumnConfig<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  render?: (item: T) => React.ReactNode;
}

/**
 * Acción de fila para DataTable.
 */
export interface RowAction<T> {
  label: string;
  icon?: string;
  onClick: (item: T) => void;
  variant?: "default" | "danger" | "warning";
  visible?: (item: T) => boolean;
}

// ─── TEMAS ─────────────────────────────────────────────────

/**
 * Tema de la aplicación.
 */
export type Theme = "light" | "dark" | "system";

/**
 * Configuración de tema.
 */
export interface ThemeConfig {
  theme: Theme;
  primaryColor?: string;
  borderRadius?: number;
  fontSize?: "sm" | "md" | "lg";
}