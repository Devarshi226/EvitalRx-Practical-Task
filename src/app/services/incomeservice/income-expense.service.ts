import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncomeExpenseService {
  constructor(private http: HttpClient) { }

  private expenseUrladd = "https://staging.evitalrx.in:3000/v3/expenses/add";

  private accesstoken = '9f3zwuwwfkzofjoq';
  private deviceId = 'bdc16a3d-2c55-4cd8-94a9-c1af1c3bc167'
  private chemist_id = 1186;
  private login_parent_id = 1186;



  getData(page: number, startDate?: Date, endDate?: Date): Observable<any> {
    const today = new Date();
    const defaultStartDate = startDate ? startDate.toISOString().split('T')[0] : today.toISOString().split('T')[0];
    const defaultEndDate = endDate ? endDate.toISOString().split('T')[0] : today.toISOString().split('T')[0];

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
    return this.http.post('https://staging.evitalrx.in:3000/v3/expenses/list', listData, { headers });
  }



  addData(data: any): Observable<any> {
    const formData = new FormData();
    formData.append('accesstoken', this.accesstoken);
    formData.append('category_id', data.category_id);
    formData.append('expense_date', data.expense_date);
    formData.append('payment_method_id', data.payment_method_id);
    formData.append('amount', data.amount);
    formData.append('remark', data.remark);
    formData.append('account_id', data.account_id);
    formData.append('cheque_date', data.cheque_date);
    formData.append('reference_no', data.reference_no);
    formData.append('payment_date', data.payment_date);
    formData.append('transaction_type', data.transaction_type);
    formData.append('party_name', data.party_name);
    formData.append('chemist_id', data.chemist_id);
    formData.append('device_id', this.deviceId);
    formData.append('login_parent_id', data.chemist_id);

    return this.http.post(this.expenseUrladd, formData);
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
      'https://staging.evitalrx.in:3000/v3/expenses/delete',
      requestBody,
      { headers }
    );
  }







}



