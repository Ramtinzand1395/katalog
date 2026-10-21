import { revalidatePath, revalidateTag } from "next/cache";

import { MongoGalleryRepository } from "@/lib/gallery-repository";
import { handleSyncRequest } from "@/lib/sync-handler";

export async function POST(request: Request): Promise<Response> {
  return handleSyncRequest(request, {
    getApiKey: () => process.env.GALLERY_SYNC_API_KEY,
    getRepository: () => new MongoGalleryRepository(),
    onSynced: () => {
      revalidateTag("gallery-items", { expire: 0 });
      revalidatePath("/");
    },
  });
}
