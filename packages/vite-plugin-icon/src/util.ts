import fs from "fs";
import type { IconifyIcon, IconifyJSON } from "iconify-icon";
import { resolve } from "path";

import { parseIconifyJSON } from "./storage";

async function cacheFilename(
  cacheDir: string,
  prefix: string,
  icon: string
): Promise<string> {
  const dirname = `${cacheDir}/${prefix}`;

  if (!fs.existsSync(dirname)) {
    await fs.promises.mkdir(dirname, { recursive: true });
  }

  return resolve(dirname, `${icon}.json`);
}

export async function load(
  cacheDir: string,
  name: string
): Promise<IconifyIcon | undefined> {
  // TODO: 動的な値も扱える仕組みを考える
  const [prefix, icon] = name.split(":");
  if (!prefix || !icon) {
    return;
  }

  const filename = await cacheFilename(cacheDir, prefix, icon);
  if (fs.existsSync(filename)) {
    return JSON.parse(fs.readFileSync(filename, "utf-8"));
  }

  const url = `https://api.iconify.design/${prefix}.json?icons=${icon}`;
  const data = await fetch(url).then((r) => {
    if (!r.ok) {
      throw new Error(
        `[${PACKAGE_NAME}] Failed to fetch '${url}' ${r.status} ${r.statusText}.`
      );
    }

    return r.json();
  });

  const iconData = parseIconifyJSON(data as IconifyJSON)[icon];
  if (!iconData) {
    throw new Error(`[${PACKAGE_NAME}] '${name}' not found.`);
  }

  fs.writeFileSync(filename, JSON.stringify(iconData));

  return iconData;
}
