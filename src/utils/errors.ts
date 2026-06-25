export enum ApiError {
	VALIDATION_FAILED = "VALIDATION_FAILED",
	DUPLICATE = "DUPLICATE",
	INVALID_INPUT = "INVALID_INPUT",
	ALREADY_DONE = "ALREADY_DONE",

	BAD_REQUEST = "BAD_REQUEST",
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",
	NOT_FOUND = "NOT_FOUND",
	SERVER_ERROR = "SERVER_ERROR",
}

export const ErrorMessage: Record<ApiError, string> = {
	[ApiError.VALIDATION_FAILED]: "入力内容に不備があります。",
	[ApiError.DUPLICATE]: "指定された{}はすでに存在します。",
	[ApiError.INVALID_INPUT]: "{}が間違っています。",
	[ApiError.ALREADY_DONE]: "すでに{}済みです。",
	[ApiError.BAD_REQUEST]: "不正なリクエストです。",
	[ApiError.UNAUTHORIZED]: "ログインしてください。",
	[ApiError.FORBIDDEN]: "権限がありません。",
	[ApiError.NOT_FOUND]: "指定されたリソースが見つかりませんでした。",
	[ApiError.SERVER_ERROR]:
		"不明なエラーが発生しました。時間を置いてやり直してください。",
} as const;
