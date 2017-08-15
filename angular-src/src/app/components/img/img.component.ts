import { Component, OnInit } from '@angular/core';
import { ImgService } from '../../services/img.service';

@Component({
  selector: 'app-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.css']
})
export class ImgComponent implements OnInit {

  images : any;

  constructor(private imgService : ImgService) { }

  ngOnInit() {
    this.imgService.getImages().subscribe(data => {
      if (data) {
        this.images = data;
        this.images = this.images.img.data;

        //let img = document.createElement('img');
        //img.src = 'data:image/jpeg;base64,' + this.images.img.data;
        //console.log('img src : ', img.src);
        //document.body.appendChild(img);
      } else {
        console.log('error occured.');
      }
    });
  }
}
