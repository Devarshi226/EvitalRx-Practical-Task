import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncomeExpenseService {
  constructor(private http: HttpClient) { }

  private readonly baseUrl = 'https://staging.evitalrx.in:3000/v3/expenses';

  private accesstoken = 'bm54csldu20av8jt';
  private deviceId = 'bdc16a3d-2c55-4cd8-94a9-c1af1c3bc167'
  private chemist_id = 1186;
  private login_parent_id = 1186;



  getData(page: number, startDate?: Date, endDate?: Date): Observable<any> {
    const today = new Date();
    const defaultStartDate = startDate ? this.timeConverter(startDate) : this.timeConverter(today);
    const defaultEndDate = endDate ? this.timeConverter(endDate) :this.timeConverter(today);

    const listData: any = {
      "page": page,
      "start_date": defaultStartDate,
      "end_date": defaultEndDate,
      "accesstoken": this.accesstoken,
      "device_id": this.deviceId,
      "chemist_id": this.chemist_id,
      "login_parent_id": this.login_parent_id
    }
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post(`${this.baseUrl}/list`, listData, { headers });
  }



  addData(data: any): Observable<any> {
    debugger
    console.log(data);

    const PaymentDate = data.paymentDate
      ? this.timeConverter(data.paymentDate)
      : this.timeConverter(data.expense_date);


    const formData = new FormData();
    formData.append('accesstoken', this.accesstoken);
    formData.append('invoice_photo', data.document);
    formData.append('category_id', data.category_id);
    formData.append('expense_date', this.timeConverter(data.expense_date));
    formData.append('payment_method_id', data.payment_mode);
    formData.append('amount', data.amount);
    formData.append('remark', data.remark);
    formData.append('account_id', data.account_id);
    formData.append('cheque_date', data.cheque_date);
    formData.append('reference_no', data.reference_no);
    formData.append('payment_date', PaymentDate);
    formData.append('transaction_type', data.transaction_type);
    formData.append('party_name', data.party_name);
    formData.append('chemist_id', this.chemist_id.toString());
    formData.append('device_id', this.deviceId);
    formData.append('login_parent_id', this.login_parent_id.toString());
    if (data.gstn_number) {
      formData.append('gstn_number', data.gstn_number);
      formData.append('gst_percentage', data.gst_percentage);
      formData.append('hsn_sac_code', data.hsn_sac_code);
    }
    return this.http.post(`${this.baseUrl}/add`, formData);
  }

  deleteTransaction(id: number): Observable<any> {
    debugger;
    const requestBody = {
      accesstoken: this.accesstoken,
      device_id: this.deviceId,
      login_parent_id: this.login_parent_id,
      chemist_id: this.chemist_id,
      expense_id: id
    };
    const headers = { 'Content-Type': 'application/json' };

    return this.http.post(
      `${this.baseUrl}/delete`,
      requestBody,
      { headers }
    );
  }

  timeConverter(data:any){
    return data.toISOString().split('T')[0]
  }









}



