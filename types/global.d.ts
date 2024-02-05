import { LogFileWriter } from "~/utils/classes";

declare global {
    namespace NodeJS {
        interface Global {
            $FileLogger: LogFileWriter
        }
    }

    var $FileLogger: LogFileWriter
}


export type APIResponse = {
    status: number;
    body?: any;
}

export enum Status {
    success = 200,
    created = 201,
    accepted = 202,
    noContent = 204,
    badRequest = 400,
    unauthorized = 401,
    forbidden = 403,
    notFound = 404,
    conflict = 409,
    unprocessableEntity = 422,
    internalServerError = 500,
    notImplemented = 501,
    badGateway = 502,
    serviceUnavailable = 503,
    gatewayTimeout = 504
}
