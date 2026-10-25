export async function fetcher(...args: Parameters<typeof fetch>) {
  const response = await fetch(...args);
  if (!response.ok)
    throw new Error(`Orbital data request failed: ${response.status}`);
  const data = await response.json();
  if (
    !Array.isArray(data) ||
    !data[0]?.EPOCH ||
    !Number.isFinite(Number(data[0]?.MEAN_MOTION))
  )
    throw new Error("Invalid orbital data");
  return data;
}
