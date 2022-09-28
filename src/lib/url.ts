import { URL } from "node:url";
import type { EnvType } from "./env";

export const parseUrl = (url: string) => {
  const parsedUrl = new URL(url);

  return {
    protocol: (parsedUrl.protocol.replace(":", "") ||
      undefined) as EnvType["PROTOCOL"],
    username: parsedUrl.username || undefined,
    password: parsedUrl.password || undefined,
    hostname: parsedUrl.hostname || undefined,
    port:
      parsedUrl.port === "" ? undefined : Number.parseInt(parsedUrl.port, 10),
    pathname: parsedUrl.pathname || undefined,
    search: parsedUrl.search,
  };
};

export const createUrl = (parts: ReturnType<typeof parseUrl>) =>
  `${parts.protocol ?? ""}://${parts.username ?? ""}:${parts.password ?? ""}@${
    parts.hostname ?? ""
  }${parts.port ? `:${parts.port}` : ""}${parts.pathname ?? ""}${
    parts.search === ""
      ? ""
      : `${parts.search.startsWith("?") ? "" : "?"}${parts.search}`
  }`;

export const getProtocol = (url: string | ReturnType<typeof parseUrl>) => {
  if (typeof url === "string") {
    const parsed = parseUrl(url);

    return parsed.protocol?.replace(":", "") ?? "";
  }

  return url.protocol?.replace(":", "") ?? "";
};
