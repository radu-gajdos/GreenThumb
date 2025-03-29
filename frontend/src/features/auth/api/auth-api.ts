import http from "../../../api/http";
import { ToastService } from "../../../services/toast.service";

export default class AuthApi {
    public async disableTwoStepAuth(callback : (response: any) => void) : Promise<any> {
        try {
            const response = await http.post('/two-factor/disable');
            callback(response);
        } catch (error : any) {
            if(error?.response?.data?.message){
                ToastService.error(error.response.data.message);
            }else{
                ToastService.error(error.message);
            }
        }
    }

    public async enableEmail(callback : (response: any) => void) : Promise<any> {
        try {
            const response = await http.post('/two-factor/enableEmail');
            callback(response);
        } catch (error : any) {
            if(error?.response?.data?.message){
                ToastService.error(error.response.data.message);
            }else{
                ToastService.error(error.message);
            }
        }
    }

    public async enableApp(callback : (response: any) => void) : Promise<any> {
        try {
            const response = await http.post('/two-factor/enable');
            callback(response);
        } catch (error : any) {
            if(error?.response?.data?.message){
                ToastService.error(error.response.data.message);
            }else{
                ToastService.error(error.message);
            }
        }
    }

    public async verify(
        code: string, 
        callback : (response: any) => void,
        errorCallback : (error: string) => void,
    ) : Promise<any> {
        try {
            const response = await http.post('/two-factor/verify-setup', {token: code});
            callback(response);
        } catch (error : any) {
            if(error?.response?.data?.message){
                errorCallback(error.response.data.message);
            }else{
                errorCallback(error.message);
            }
        }
    }
}