/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_ENV: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_ALLOWED_FILE_TYPES: string;
  readonly VITE_DEFAULT_PAGE_SIZE: string;
  readonly VITE_MAX_PAGE_SIZE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}