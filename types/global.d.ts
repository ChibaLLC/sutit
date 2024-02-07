import {Logger} from "~/server/utils/classes";


declare global {
    namespace NodeJS {
        interface Global {
            $Logger: Logger
        }
    }

    var $Logger: Logger
}