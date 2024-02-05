import { LogFileWriter } from "~/utils/classes";

declare global {
    namespace NodeJS {
        interface Global {
            $FileLogger: LogFileWriter
        }
    }

    var $FileLogger: LogFileWriter
}