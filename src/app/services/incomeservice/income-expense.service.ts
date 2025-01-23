import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class IncomeExpenseService {
  private readonly baseUrl = 'https://staging.evitalrx.in:3000/v3/expenses';
  private readonly headers = new HttpHeaders().set('Content-Type', 'application/json');
  private readonly config = {
    accesstoken: 'bm54csldu20av8jt',
    device_id: 'bdc16a3d-2c55-4cd8-94a9-c1af1c3bc167',
    chemist_id: 1186,
    login_parent_id: 1186
  };

  constructor(private http: HttpClient) {}

  executeRequest(endpoint: string, requestData: any = {}): Observable<any> {
    let payload: any;

    if (endpoint === 'list') {
      payload = {
        ...this.config,
        page: requestData.page,
        start_date: this.formatDate(requestData.startDate || new Date()),
        end_date: this.formatDate(requestData.endDate || new Date())
      };
    } else if (endpoint === 'add') {
      console.log(requestData);


      const formData = new FormData();
      formData.append('accesstoken', this.config.accesstoken);
      formData.append('device_id', this.config.device_id);
      formData.append('chemist_id', this.config.chemist_id.toString());
      formData.append('login_parent_id', this.config.login_parent_id.toString());
      formData.append('invoice_photo', requestData.document);
      formData.append('category_id', requestData.category_id);
      formData.append('expense_date', this.formatDate(requestData.expense_date));
      formData.append('payment_method_id', requestData.payment_mode);
      formData.append('amount', requestData.amount);
      formData.append('remark', requestData.remark);
      formData.append('cheque_date', requestData.cheque_date);
      formData.append('reference_no', requestData.reference_no);
      formData.append('transaction_type', requestData.transaction_type);
      formData.append('party_name', requestData.party_name);
      formData.append('payment_date', this.formatDate(requestData.paymentDate || requestData.expense_date))

  if (requestData.gstn_number) {
    formData.append('gstn_number', requestData.gstn_number);
    formData.append('gst_percentage', requestData.gst_percentage);
    if(requestData.hsnCode){
      formData.append('hsn_sac_code', requestData.hsn_sac_code);
    }else{
      formData.append('hsn_sac_code', '123456');
    }
  }

      return this.http.post(`${this.baseUrl}/${endpoint}`, formData)
    } else if (endpoint === 'delete') {
      payload = {
        ...this.config,
        expense_id: requestData.id
      };
    }

    return this.http.post(`${this.baseUrl}/${endpoint}`, payload, { headers: this.headers })
  }



  private formatDate = (date: Date): string => date.toISOString().split('T')[0];
}

