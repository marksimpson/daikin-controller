import { DaikinDataParser, ResponseDict } from '../../DaikinDataParser';
import { DaikinResponseCb } from '../../DaikinACRequest';
import { FanDirection } from '../../DaikinACTypes';

export class ModelInfoResponse {
    public model?: string;
    public type?: string;
    public pv?: number;
    public cpv?: number;
    public mid?: string;
    public sFanDirection?: number;
    public enScdltmr?: number;
    // Which special modes (streamer, powerful, econo) the adapter exposes.
    // Zero means none at all; absent means the adapter never said.
    public enSpMode?: number;

    public static parseResponse(dict: ResponseDict, cb: DaikinResponseCb<ModelInfoResponse>): void {
        const result = new ModelInfoResponse();
        result.model = DaikinDataParser.resolveString(dict, 'model');
        result.type = DaikinDataParser.resolveString(dict, 'type');
        result.pv = DaikinDataParser.resolveInteger(dict, 'pv');
        result.cpv = DaikinDataParser.resolveInteger(dict, 'cpv');
        result.mid = DaikinDataParser.resolveString(dict, 'mid');
        result.sFanDirection = DaikinDataParser.resolveInteger(dict, 's_fdir', FanDirection);
        result.enScdltmr = DaikinDataParser.resolveInteger(dict, 'en_scdltmr');
        result.enSpMode = DaikinDataParser.resolveInteger(dict, 'en_spmode');
        cb(null, 'OK', result);
    }
}
