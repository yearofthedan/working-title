export interface MessageSchema {
  app: {
    name: string
    home: {
      subtitle: string
      demo: {
        title: string
        description: string
      }
      newProject: {
        title: string
        description: string
      }
    }
    canvas: {
      emptyState: {
        title: string
        description: string
        allStepsAdded: string
      }
    }
    loading: {
      message: string
    }
    notFound: {
      title: string
      backHome: string
    }
  }
  common: {
    actions: {
      save: string
      cancel: string
    }
  }
  errors: {
    generic: string
  }
}

declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}
}
