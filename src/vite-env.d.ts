/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Only used to build storage image-transform URLs — the Supabase SDK is gone. */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_FACEBOOK_PAGE_ID?: string;
  readonly VITE_META_PIXEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
