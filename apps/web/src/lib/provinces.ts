/** Vietnam administrative divisions — https://provinces.open-api.vn/api/v2/redoc */
export const PROVINCES_API_BASE =
  process.env.NEXT_PUBLIC_PROVINCES_API_URL ?? "https://provinces.open-api.vn/api/v2";

export interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
}

export async function fetchProvinces(): Promise<Province[]> {
  const res = await fetch(`${PROVINCES_API_BASE}/p/`);
  if (!res.ok) throw new Error("Không tải được danh sách tỉnh thành");
  const data = (await res.json()) as Province[];
  return data.sort((a, b) => a.name.localeCompare(b.name, "vi"));
}
