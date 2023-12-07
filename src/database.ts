import { default as knex, Knex } from "knex";
import { env } from "./env";

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: './db/app.db',
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}


export const knexServer = knex( config )