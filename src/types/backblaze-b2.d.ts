declare module 'backblaze-b2' {
  interface B2AuthorizeResponse {
    data: {
      authorizationToken: string;
      apiUrl: string;
      downloadUrl: string;
    };
  }

  interface B2UploadUrlResponse {
    data: {
      uploadUrl: string;
      authorizationToken: string;
    };
  }

  interface B2UploadResponse {
    data: {
      fileId: string;
      fileName: string;
      contentType: string;
      fileInfo: Record<string, any>;
    };
  }

  interface B2FileVersion {
    fileId: string;
    fileName: string;
    contentType: string;
    fileInfo: Record<string, any>;
  }

  interface B2ListFileVersionsResponse {
    data: {
      files: B2FileVersion[];
      nextFileName?: string;
      nextFileId?: string;
    };
  }

  interface B2Config {
    applicationKeyId: string;
    applicationKey: string;
  }

  interface B2UploadFileParams {
    uploadUrl: string;
    uploadAuthToken: string;
    fileName: string;
    data: Buffer;
    info?: Record<string, string>;
  }

  interface B2GetUploadUrlParams {
    bucketId: string;
  }

  interface B2ListFileVersionsParams {
    bucketId: string;
    startFileName?: string;
    maxFileCount?: number;
  }

  interface B2DeleteFileVersionParams {
    fileId: string;
    fileName: string;
  }

  interface B2GetDownloadAuthorizationParams {
    bucketId: string;
    fileNamePrefix: string;
    validDurationInSeconds: number;
  }

  interface B2GetDownloadAuthorizationResponse {
    data: {
      authorizationToken: string;
    };
  }

  class B2 {
    constructor(config: B2Config);

    authorize(): Promise<B2AuthorizeResponse>;

    getUploadUrl(params: B2GetUploadUrlParams): Promise<B2UploadUrlResponse>;

    uploadFile(params: B2UploadFileParams): Promise<B2UploadResponse>;

    listFileVersions(params: B2ListFileVersionsParams): Promise<B2ListFileVersionsResponse>;

    deleteFileVersion(params: B2DeleteFileVersionParams): Promise<void>;

    getDownloadAuthorization(params: B2GetDownloadAuthorizationParams): Promise<B2GetDownloadAuthorizationResponse>;
  }

  export default B2;
}
