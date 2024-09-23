export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  expires: process.env.TOKEN_EXPIRE,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpires: process.env.JWT_REFRESH_EXPIRATION,
};
