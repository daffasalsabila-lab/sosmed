export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
  static badRequest(m, e) { return new ApiError(400, m, e); }
  static unauthorized(m = 'Tidak terautentikasi') { return new ApiError(401, m); }
  static forbidden(m = 'Anda tidak memiliki akses') { return new ApiError(403, m); }
  static notFound(m = 'Data tidak ditemukan') { return new ApiError(404, m); }
  static conflict(m, e) { return new ApiError(409, m, e); }
  static unprocessable(m, e) { return new ApiError(422, m, e); }
}
