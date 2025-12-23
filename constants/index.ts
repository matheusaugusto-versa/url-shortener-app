export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    GET_USER: "/auth/me",
  },
  URLS: {
    CREATE: "/urls",
    LIST: "/urls",
    DELETE: "/urls",
    UPDATE: "/urls",
  },
};

export const EXPIRATION_OPTIONS = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
  { value: "365", label: "1 ano" },
];

export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  URL_MAX_LENGTH: 2048,
};

export const TOAST_MESSAGES = {
  COPY_SUCCESS: "URL copiada para a área de transferência!",
  COPY_ERROR: "Erro ao copiar URL",
  DELETE_SUCCESS: "URL excluída com sucesso",
  DELETE_ERROR: "Erro ao excluir URL",
  CREATE_SUCCESS: "URL encurtada com sucesso",
  CREATE_ERROR: "Erro ao encurtar URL",
  LOGIN_SUCCESS: "Login realizado com sucesso",
  LOGIN_ERROR: "Erro ao fazer login",
  REGISTER_SUCCESS: "Conta criada com sucesso",
  REGISTER_ERROR: "Erro ao criar conta",
  LOGOUT_SUCCESS: "Logout realizado",
  UPDATE_SUCCESS: "URL atualizada com sucesso",
  UPDATE_ERROR: "Erro ao atualizar URL",
  NETWORK_ERROR: "Erro de conexão. Tente novamente.",
  SESSION_EXPIRED: "Sua sessão expirou. Faça login novamente.",
};

export const DEBOUNCE_DELAY = 500;
export const PAGINATION_LIMIT = 5;
export const REQUEST_TIMEOUT = 10000; // 10 segundos
export const MAX_RETRIES = 3;
