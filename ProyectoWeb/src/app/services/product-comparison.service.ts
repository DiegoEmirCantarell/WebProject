import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface MercadoLibreProduct {
  id: string;
  title: string;
  price: number;
  permalink: string;
  thumbnail: string;
  condition: string;
  seller: {
    id: number;
    nickname: string;
  };
  attributes: Array<{
    name: string;
    value_name: string;
  }>;
}



export interface AmazonProduct {
  title: string;
  price: string;
  rating: string;
  image: string;
}

export interface AmazonResponse {
  status: string;
  data: AmazonProduct[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductComparisonService {
  private apiUrl = 'http://localhost:3000/api/scraping/compare';

  constructor(private http: HttpClient) {}


  compareWithAmazon(productName: string): Observable<AmazonProduct[]> {
    return this.http.get<AmazonResponse>(`${this.apiUrl}?product=${encodeURIComponent(productName)}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error en web scraping:', error);
          throw error;
        })
      );
  }
}