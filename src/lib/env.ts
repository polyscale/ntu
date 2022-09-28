import envSchema from "env-schema";
import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";

const schema = Type.Object({
  SLACK_WEBHOOK: Type.Optional(Type.String()),
  URL: Type.Optional(Type.String()),
  PROTOCOL: Type.Optional(
    Type.Union([
      Type.Literal("http"),
      Type.Literal("https"),
      Type.Literal("tcp"),
      Type.Literal("mysql"),
      Type.Literal("postgres"),
      Type.Literal("postgresql"),
      Type.Literal("mariadb"),
      Type.Literal("mssql"),
    ])
  ),
  USERNAME: Type.Optional(Type.String()),
  PASSWORD: Type.Optional(Type.String()),
  HOSTNAME: Type.Optional(Type.String()),
  PORT: Type.Optional(Type.String()),
  PATHNAME: Type.Optional(Type.String()),
  SEARCH: Type.Optional(Type.String()),
  TEST: Type.Union([Type.Literal("load"), Type.Literal("latency")]),
  QUERY: Type.Optional(Type.String()),
});

export type EnvType = Static<typeof schema>;

export default envSchema<EnvType>({
  schema,
  dotenv: true,
});
