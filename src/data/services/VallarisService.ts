import { FetchResult } from "../models/NetworkResult";
import TreesRequestParams from "../models/TreesRequest";
import { TreesResponse } from "../models/TreesResponse";
import UpdateTreeInfoBody from "../models/UpdateTreeInfoBody";
import NetworkRequestHandler from "./NetworkRequestHandler";

// TODO implement simple caching with a map to prevent multiple network calls. Thsi way, we can just think of all trees as server state and fetch on demand (whenever).
export default class VallarisService {
  private static _networkHandler = new NetworkRequestHandler({
    baseUrl: "https://v2k-dev.vallarismaps.com/core/api",
  });
  private static _collectionId = "64169999e89e47973094f506";

  public static async getAllTrees(
    request?: TreesRequestParams,
    fromCacheIfExists = true
  ) {
    const path = `/features/1.0/collections/${VallarisService._collectionId}/items`;
    const data = await VallarisService._networkHandler.handle<TreesResponse>({
      fromCacheIfExists,
      method: "GET",
      path: path,
      headers: {
        // @ts-ignore
        "api-key": import.meta.env.VITE_VALLARIS_API_KEY,
      },
      queryParams: {
        limit: request?.limit,
        bbox: request?.boundingBox?.join(" ,"),
      },
    });

    return data;
  }

  /**
   * Returns a pre-configured Libre map style
   *
   * config here: https://v2k-dev.vallarismaps.com/management/visual/style
   */
  public static getMapStyle(): FetchResult<string> {
    // TODO Replace Libre map style with the actual one we're gonna be using in prod.
    const styleId = "64149d10dc84d7b8cd687c5e";

    return {
      result: `https://v2k-dev.vallarismaps.com/core/api/styles/1.0-beta/styles/${styleId}?api_key=${
        // @ts-ignore
        import.meta.env.VITE_VALLARIS_API_KEY
      }`,
      fromCache: true,
    };
  }

  public static async updateTreeData(
    request: UpdateTreeInfoBody
  ): Promise<FetchResult<void>> {
    const result = await VallarisService._networkHandler.handle<void>({
      method: "PUT",
      headers: {
        // @ts-ignore
        "api-key": import.meta.env.VITE_VALLARIS_API_KEY,
        "content-type": "application/json",
      },
      path: `/features/1.0-beta/collections/${VallarisService._collectionId}/items/${request.id}`,
      body: JSON.stringify(request),
    });

    return result;
  }
}
