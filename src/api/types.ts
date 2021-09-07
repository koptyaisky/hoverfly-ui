/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RootState } from '../store';

export type ApiType = { hoverfly: IHoverflyApi };

export interface IRequestCreateOptions {
    baseURL: string;
}
export interface IRequestConfig {
    headers: {
        [key: string]: string;
    };
}

export type IRequestResponse<T> = {
    data: T;
    status: number;
    statusText: string;
    headers: {
        [key: string]: string;
    };
};

export interface IRequest {
    instance: any;
    get: <T>(url: string, options?: IRequestConfig) => Promise<IRequestResponse<T>>;
    post: <T>(url: string, params: any, options?: IRequestConfig) => Promise<IRequestResponse<T>>;
    delete: <T>(url: string, options?: IRequestConfig) => Promise<IRequestResponse<T>>;
}

export type ThunkApiConfig = {
    rejectValue: Error;
    extra: ApiType;
    state: RootState;
};

export type MainInfo = {
    cors: {
        enabled: boolean;
        allowOrigin?: string;
        allowMethods?: string;
        allowHeaders?: string;
        preflightMaxAge?: number;
        allowCredentials?: boolean;
    };
    destination: string;
    middleware?: {
        binary: string;
        script: string;
        remote: string;
    };
    mode: string;
    arguments: {
        matchingStrategy: string;
    };
    isWebServer: boolean;
    usage: {
        counters: {
            capture: number;
            diff: number;
            modify: number;
            simulate: number;
            spy: number;
            synthesize: number;
        };
    };
    version: string;
    upstreamProxy: string;
};

export type DeleteCache = { cache: string | null };

export interface IHoverflyApi {
    fetchMainInfo(): Promise<IRequestResponse<MainInfo>>;
    fetchDeleteCache(): Promise<IRequestResponse<DeleteCache>>;
    fetchShutdown(): Promise<IRequestResponse<void>>;
}