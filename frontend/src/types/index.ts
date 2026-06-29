// src/types/index.ts

// ─── API ───────────────────────────────────────────────────

export type {
  PaginatedResponse,
  ApiError,
  ValidationError,
  ValidationErrorDetail,
  PaginationParams,
  SortParams,
  SortDirection,
  MessageResponse,
  SuccessResponse,
  BaseFilters,
  ApiVersion,
  MutationState,
} from "@/types/api.types";

// ─── COMMON ────────────────────────────────────────────────

export type {
  DeepPartial,
  RequiredKeys,
  OptionalKeys,
  ArrayElement,
  Nullable,
  Optional,
  SelectOption,
  SelectOptionWithIcon,
  GeoCoordinates,
  Address,
  UploadStatus,
  UploadedFile,
  ImageDimensions,
  DateRange,
  TimePeriod,
  AsyncState,
  AsyncStateProps,
  ModalSize,
  ModalProps,
  NotificationType,
  Notification,
  ColumnConfig,
  RowAction,
  Theme,
  ThemeConfig,
} from "@/types/common.types";