
    export type RemoteKeys = 'REMOTE_ALIAS_IDENTIFIER/ShoppingCartPage';
    type PackageType<T> = T extends 'REMOTE_ALIAS_IDENTIFIER/ShoppingCartPage' ? typeof import('REMOTE_ALIAS_IDENTIFIER/ShoppingCartPage') :any;