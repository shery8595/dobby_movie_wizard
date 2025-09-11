/// <reference types="@vercel/node" />

declare namespace NodeJS {
  interface ProcessEnv {
    TMDB_API_KEY: string;
    FIREWORK_API_KEY: string;
    DOBBY_MODEL: string;
  }
}
