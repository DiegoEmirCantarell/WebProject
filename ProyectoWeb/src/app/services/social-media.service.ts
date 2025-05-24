import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface TweetResponse {
  status: 'success' | 'error';
  data?: {
    id: string;
    text: string;
    created_at: string;
  };
  message?: string;
  detail?: string;
}

interface TweetRequest {
  text: string;
  card_uri?: string;
  quote_tweet_id?: string;
  poll?: any;
  media?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SocialMediaService {
  private apiUrl = 'http://localhost:3000/api/social';

  constructor(private http: HttpClient) {}

  postToX(message: string, cardUri?: string): Observable<TweetResponse> {
    const tweetData: TweetRequest = {
      text: message
    };

    if (cardUri) {
      tweetData.card_uri = cardUri;
    }

    return this.http.post<TweetResponse>(`${this.apiUrl}/tweet`, tweetData);
  }
}