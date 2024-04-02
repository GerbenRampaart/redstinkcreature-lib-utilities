import {
	type AxiosRequestConfig,
	type InternalAxiosRequestConfig,
} from 'axios';

export type Metadata = {
	start?: [number, number];
	end?: [number, number];
	elapsed?: number;
	startDate?: Date;
	endDate?: Date;
	correlationId?: string;
	requestId?: string;
};

export type InternalAxiosRequestConfigWithMetadata<T> =
	& InternalAxiosRequestConfig<T>
	& { metadata?: Metadata };
export type AxiosRequestConfigWithMetadata<T> = AxiosRequestConfig<T> & {
	metadata?: Metadata;
};
