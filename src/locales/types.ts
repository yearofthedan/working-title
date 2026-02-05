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
        dialog: {
          title: string
          nameLabel: string
          namePlaceholder: string
          create: string
        }
      }
      projectList: {
        title: string
        empty: string
        updatedAt: string
        item: {
          delete: string
          deleteConfirmTitle: string
          deleteConfirmMessage: string
          deleteSuccess: string
          deleteError: string
          templateBadge: string
        }
      }
      openFile: {
        title: string
        description: string
        error: string
      }
      createProject: {
        error: string
      }
      loadProjects: {
        error: string
      }
    }
    project: {
      loading: string
      loadError: {
        title: string
        description: string
        retry: string
        goHome: string
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
    notifications: {
      types: {
        success: string
        error: string
        warning: string
      }
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
      delete: string
      close: string
    }
  }
  writingProject: {
    saveStatus: {
      saved: string
      saving: string
      error: string
    }
    sidebar: {
      contextTitle: string
    }
  }
  errors: {
    generic: string
    boundary: {
      title: string
      message: string
      refresh: string
      goHome: string
      technical: string
      stackTitle: string
      copy: string
      copied: string
    }
  }
  browserSupport: {
    warning: {
      title: string
      message: string
      limitation: string
    }
  }
}

declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}
}
