export class ConfigurationNotFoundError extends Error {
  constructor() {
    super('Không tìm thấy cấu hình của user.');
    this.name = ConfigurationNotFoundError.name;
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('Không tìm thấy user.');
    this.name = UserNotFoundError.name;
  }
}
