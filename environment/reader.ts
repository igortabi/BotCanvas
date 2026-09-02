import {configDotenv, DotenvConfigOptions } from "dotenv"
import path from "node:path";

const options = {} as DotenvConfigOptions;
options.path = path.resolve(__dirname,"./.env")
configDotenv(options)

export const ENVIRONMENT = {
    TOKEN: process.env.TOKEN,
    CLIENT_ID: process.env.CLIENT_ID
}
