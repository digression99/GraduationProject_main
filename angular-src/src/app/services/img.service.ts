import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ImgService {

  constructor(private http : Http) { }

  getImages() {
    // later, I should change this to post request, sending user id.
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    // for heroku, remove http://localhost:3000/ ...
    return this.http.get('http://localhost:3000/api/face', {headers:headers}).map(res => res.json());
    //
    //   {
    //   console.log('successfully turned back.');
    //   res.json();
    // }
    //)
  };

  getTestImage() {
    // later, I should change this to post request, sending user id.
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    // for heroku, remove http://localhost:3000/ ...
    return this.http.get('http://localhost:3000/api/test', {headers:headers}).map(res => res.json());
    //
    //   {
    //   console.log('successfully turned back.');
    //   res.json();
    // }
    //)
  };
}
