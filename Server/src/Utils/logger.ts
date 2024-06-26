import config from '../../config.json';
import { DeleteFile, WriteLineToFile } from 'src/Controllers/FileSystem/DataSaver';
import { ReadFolderContents } from 'src/Controllers/FileSystem/FileReader';

/**
 * Abstraction for `console.log`, so that we can switch logging libraries in the future
 * Also allows us to dump to log files for support purposes.
 */
export class Logger {
    private logfilename: string;

    constructor() {
        this.logfilename = null;
    }

    /**
     * Called when the server is started, and will continue logging to that file.
     * Is also re-called if server has been running without players, and this is the first player to join.
     */
    public init() : void {
        if (config.enableLogFiles) {
            const existingLogs = ReadFolderContents('logging', null, null, false);
            if (existingLogs.length > config.maximumLogFiles) {
                existingLogs.sort((a, b) => {
                    // Expects filenames to be <utc-milliseconds>_raid_review.log
                    return parseInt(a.split('_')[0]) - parseInt(b.split('_')[0]);
                });
                DeleteFile('logs', null, null, existingLogs[0])
            }
            this.logfilename = `${new Date().getTime()}_raid_review.log`;
            this.log(`New log file created for session '${this.logfilename}', this can be found in the '/logs' directory of the mod folder.`)
        }
    }


    public log(str: string): void {
        console.log(`[RAID-REVIEW] ${str}`);

        if (config.enableLogFiles) {
            this.appendToLogFile(str);
        }
    }


    public debug(str: string): void {
        if (config.enableDebugLogs) {
            console.debug(`[RAID-REVIEW] ${str}`);

            if (config.enableVerboseLogFiles) {
                this.appendToLogFile(str);
            }
        }
    }


    public warn(str: string): void {
        console.warn(`[RAID-REVIEW] ${str}`);

        if (config.enableVerboseLogFiles) {
            this.appendToLogFile(str);
        }
    }
    

    public error(str: string, dump: any = null): void {
        console.error(`[RAID-REVIEW] ${str}`);
        if (dump) {
            console.error(`[RAID-REVIEW:DUMP] ${str}`);
        }
    }


    private appendToLogFile(str: string): void {
        const dateTime = new Date().toISOString();
        const logMessage = `${dateTime} - ${str}\n`;

        WriteLineToFile(this, 'logs', '', '', this.logfilename , dateTime, logMessage);
    }
}