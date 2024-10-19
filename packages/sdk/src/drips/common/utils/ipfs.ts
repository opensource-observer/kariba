const PUBLIC_PINATA_GATEWAY_URL = "https://gateway.pinata.cloud";

export async function fetchIpfs(hash: string, f = fetch) {
  return f(`${PUBLIC_PINATA_GATEWAY_URL}/ipfs/${hash}`);
}

export async function pin(data: Record<string, unknown>, f = fetch) {
  const res = await f("/api/ipfs/pin", {
    method: "POST",
    body: JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  });

  if (!res.ok) {
    throw new Error(`Pinning account metadata failed: ${await res.text()}`);
  }

  return res.text();
}
