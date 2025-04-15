export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum Permission {
  // User management permissions
  CREATE_USER = 'CREATE_USER',
  READ_USER = 'READ_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  
  // Book management permissions (assuming this is a book API)
  CREATE_BOOK = 'CREATE_BOOK',
  READ_BOOK = 'READ_BOOK',
  UPDATE_BOOK = 'UPDATE_BOOK',
  DELETE_BOOK = 'DELETE_BOOK',
}

// Define role-permission mappings
export const RolePermissions = {
  [Role.ADMIN]: [
    Permission.CREATE_USER,
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.CREATE_BOOK,
    Permission.READ_BOOK,
    Permission.UPDATE_BOOK,
    Permission.DELETE_BOOK,
  ],
  [Role.USER]: [
    Permission.READ_BOOK,
  ],
};