import { Injectable }            from '@angular/core';
import { HttpClient }            from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment }           from '../../../environments/environment';
import { Addressmodel, CreateAddressRequestmodel } from '../models';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private apiUrl = environment.apiUrl;

  // Shared address state — checkout page and profile
  // page both need the address list
  private addressesSubject = new BehaviorSubject<Addressmodel[]>([]);
  public  addresses$       = this.addressesSubject.asObservable();

  constructor(private http: HttpClient) {}

  get addresses(): Addressmodel[] {
    return this.addressesSubject.value;
  }

  get defaultAddress(): Addressmodel | undefined {
    return this.addressesSubject.value.find((a) => a.isDefault);
  }

  loadAddresses(): Observable<Addressmodel[]> {
    return this.http
      .get<Addressmodel[]>(`${this.apiUrl}/addresses`)
      .pipe(tap((addresses) => this.addressesSubject.next(addresses)));
  }

  createAddress(data: CreateAddressRequestmodel): Observable<Addressmodel> {
    return this.http
      .post<Addressmodel>(`${this.apiUrl}/addresses`, data)
      .pipe(tap(() => this.loadAddresses().subscribe()));
  }

  updateAddress(id: number, data: Partial<CreateAddressRequestmodel>): Observable<Addressmodel> {
    return this.http
      .put<Addressmodel>(`${this.apiUrl}/addresses/${id}`, data)
      .pipe(tap(() => this.loadAddresses().subscribe()));
  }

  deleteAddress(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/addresses/${id}`)
      .pipe(tap(() => this.loadAddresses().subscribe()));
  }

  setDefault(id: number): Observable<Addressmodel> {
    return this.http
      .patch<Addressmodel>(`${this.apiUrl}/addresses/${id}/set-default`, {})
      .pipe(tap(() => this.loadAddresses().subscribe()));
  }
}