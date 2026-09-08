export interface SavedBackground {
  blob: Blob;
  name: string;
  updatedAt: number;
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("yozaver-personal", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("backgrounds");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Rasmni bu brauzerda saqlab bo‘lmadi."));
  });
}
export async function readBackground(
  userId: string,
): Promise<SavedBackground | null> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("backgrounds", "readonly");
    const request = tx.objectStore("backgrounds").get(userId);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}
export async function writeBackground(
  userId: string,
  value: SavedBackground | null,
) {
  const db = await database();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("backgrounds", "readwrite");
    if (value) tx.objectStore("backgrounds").put(value, userId);
    else tx.objectStore("backgrounds").delete(userId);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = tx.onerror = () => {
      db.close();
      reject(new Error("Rasm saqlanmadi. Brauzer xotirasini tekshiring."));
    };
  });
}
export async function prepareBackground(file: File): Promise<SavedBackground> {
  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ].includes(file.type)
  )
    throw new Error("JPG, PNG, WebP, AVIF yoki GIF rasm tanlang.");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Rasm hajmi 10 MB dan kichik bo‘lsin.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Rasm ochilmadi. Boshqa rasm tanlang.");
  }
  try {
    const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Brauzer rasmni tayyorlay olmadi.");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error("Rasmni tayyorlab bo‘lmadi.")),
        "image/webp",
        0.82,
      ),
    );
    if (blob.size > 2 * 1024 * 1024)
      throw new Error("Rasm juda murakkab. Kichikroq rasm tanlang.");
    return { blob, name: file.name, updatedAt: Date.now() };
  } finally {
    bitmap.close();
  }
}
