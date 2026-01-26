export interface MessageSchema {
  app: {
    placeholder: string;
  };
  common: {
    placeholder: string;
  };
  errors: {
    placeholder: string;
  };
}

declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}
}
