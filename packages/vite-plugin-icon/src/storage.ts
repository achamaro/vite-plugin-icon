import type { IconifyIcon, IconifyJSON } from "iconify-icon";

const icons: Map<string, IconifyIcon | Promise<IconifyIcon>> = new Map();
const resolves: Map<string, (data: IconifyIcon) => void> = new Map();

export function addIconifyJSON(data: IconifyJSON) {
  Object.entries(parseIconifyJSON(data)).forEach(([name, iconData]) => {
    const key = `${data.prefix}:${name}`;
    addIconifyIcon(key, iconData);
  });
}

export function parseIconifyJSON(
  data: IconifyJSON
): Record<string, IconifyIcon> {
  const { width, height } = data;
  return Object.fromEntries(
    Object.entries(data.icons).map(([name, iconData]) => {
      return [
        name,
        {
          width,
          height,
          ...iconData,
        },
      ];
    })
  );
}

export function addIconifyIcon(name: string, data: IconifyIcon) {
  if (resolves.has(name)) {
    const resolve = resolves.get(name)!;
    resolves.delete(name);
    resolve(data);
  } else {
    icons.set(name, data);
  }
}

export async function getIcon(name: string): Promise<IconifyIcon> {
  if (!icons.has(name)) {
    icons.set(
      name,
      new Promise((resolve) => {
        resolves.set(name, resolve);
      })
    );
  }

  return icons.get(name)!;
}
