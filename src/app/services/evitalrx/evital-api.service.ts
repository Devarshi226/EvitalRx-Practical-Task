import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { evitalrxApi } from 'src/app/Api/evitalrx';

@Injectable({
  providedIn: 'root',
})
export class EvitalApiService {
  private baseUrl = 'https://dev-api.evitalrx.in/v1/fulfillment/';

  constructor(private http: HttpClient) {}

  getMedicinelist(searchString: string): Observable<any> {
    const formData = new FormData();
    formData.append('apikey', evitalrxApi.evitalConfig.apiKey);
    formData.append('searchstring', searchString);

    return this.http.post(`${this.baseUrl}medicines/search`, formData);
  }

  getMedicineInfo(medicine_ids: any): Observable<any> {
    const formData = new FormData();
    formData.append('apikey', evitalrxApi.evitalConfig.apiKey);
    formData.append('medicine_ids', medicine_ids);

    return this.http.post(`${this.baseUrl}medicines/view`, formData);
  }

  addPatient(patient: any): Observable<any> {
    const formData = new FormData();
    formData.append('apikey', evitalrxApi.evitalConfig.apiKey);
    formData.append('mobile', patient.mobile);
    formData.append('first_name', patient.first_name);
    formData.append('last_name', patient.last_name);
    formData.append('zipcode', patient.zipcode);
    formData.append('dob', patient.dob);
    formData.append('gender', patient.gender);
    formData.append('blood_group', patient.blood_group);

    return this.http.post(`${this.baseUrl}patients/add`, formData);
  }

  viewPatient(patient_id: any): Observable<any> {
    const formData = new FormData();
    formData.append('apikey', evitalrxApi.evitalConfig.apiKey);
    formData.append('patient_id', patient_id);

    return this.http.post(`${this.baseUrl}patients/view`, formData);
  }

  checkout(data: any): Observable<any> {
    const formData = new FormData();
    formData.append('apikey', evitalrxApi.evitalConfig.apiKey);
    formData.append('items', data.items);
    formData.append('latitude', data.latitude);
    formData.append('longitude', data.longitude);
    formData.append('distance', data.distance);

    return this.http.post(`${this.baseUrl}orders/checkout`, formData);
  }

  placeOrder(data: any): Observable<any> {
    const formData = new FormData();
    formData.append('apikey', evitalrxApi.evitalConfig.apiKey);
    formData.append('items', data.items);
    formData.append('delivery_type', data.delivery_type);
    formData.append('patient_name', data.patient_name);
    formData.append('mobile', data.mobile);
    formData.append('address', data.address);
    formData.append('city', data.city);
    formData.append('state', data.state);
    formData.append('zipcode', data.zipcode);
    formData.append('auto_assign', data.auto_assign);
    formData.append('chemist_id', data.chemist_id);
    formData.append('latitude', data.latitude);
    formData.append('longitude', data.longitude);
    formData.append('patient_id', data.patient_id);

    return this.http.post(`${this.baseUrl}orders/place_order`, formData);
  }
}
