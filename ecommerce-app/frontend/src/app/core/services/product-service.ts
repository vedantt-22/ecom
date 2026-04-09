import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { shareReplay } from 'rxjs';

// Importing your specific models
import { Productmodel } from '../models/product.model';
import { ProductTypemodel } from '../models/taxonomy.model';
import { 
  SearchParamsmodel, 
  SearchResultmodel, 
  AutocompleteResultmodel 
} from '../models/search.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private taxonomy$?: Observable<ProductTypemodel[]>;

  getProductById(id: Productmodel['id']): Observable<Productmodel> {
    return this.http.get<Productmodel>(`${this.apiUrl}/products/${id}`);
  }

  search(params: SearchParamsmodel): Observable<SearchResultmodel> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.append(key, value.toString());
      }
    });

    return this.http.get<SearchResultmodel>(`${this.apiUrl}/search`, {
      params: httpParams
    });
  }

  getSuggestions(q: string): Observable<AutocompleteResultmodel> {
    const params = new HttpParams().set('q', q);
    return this.http.get<AutocompleteResultmodel>(`${this.apiUrl}/search/suggestions`, { params });
  }

  getTaxonomyTree(): Observable<ProductTypemodel[]> {
  if (!this.taxonomy$) {
    this.taxonomy$ = this.http.get<ProductTypemodel[]>(`${this.apiUrl}/taxonomy/tree`).pipe(
      shareReplay(1)
    );
  }
  return this.taxonomy$;
}
}