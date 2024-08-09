import { registerAs } from '@nestjs/config';

export default registerAs('dbConfig', () => {
  const dbConfig = {
    db: {
      connection: process.env.DB_CONNECTION,
      host_local: process.env.DB_HOST_LOCAL,
      host_remote: process.env.DB_HOST_REMOTE,
      name_local: process.env.DB_NAME_LOCAL,
      name_remote: process.env.DB_NAME_REMOTE,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    env: process.env.ENVIRONMENT || 'local',
  };
  return dbConfig;
});
