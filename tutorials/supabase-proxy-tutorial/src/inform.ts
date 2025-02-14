import { ALL_ARTICLES_CACHE_KEY, buildKey, invalidate } from "./cache"

interface InformPayload {
  type: string
  table: string
  record: ArticleLike | null,
  schema: string
  old_record: ArticleLike | null
}

interface ArticleLike {
  id: string
}

const TYPE_INSERT = "insert";
const TYPE_UPDATE = "update";
const TYPE_DELETE = "delete";

export function processDatabaseUpdate(requestBody: ArrayBuffer): Response {
  let payload;

  try {
    const decoder = new TextDecoder();
    payload = JSON.parse(decoder.decode(requestBody)) as InformPayload;
  }
  catch (error) {
    return new Response('Bad Requst', { status: 400 });
  }
  switch (payload.type.toLowerCase()) {
    case TYPE_INSERT:
      invalidate(ALL_ARTICLES_CACHE_KEY);
      return new Response(null, { status: 200 });
    case TYPE_UPDATE:
      invalidate(buildKey(payload.record!.id));
      return new Response(null, { status: 200 });
    case TYPE_DELETE:
      invalidate(buildKey(payload.old_record!.id));
      return new Response(null, { status: 200 });
    default:
      return new Response('Bad Request', { status: 400 });
  }
}
