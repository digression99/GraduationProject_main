import { Component, OnInit } from '@angular/core';
import {ImgService } from '../../services/img.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  img : any;

  constructor(private imgService : ImgService) { }

  ngOnInit() {
    this.imgService.getTestImage().subscribe(data => {
      this.img = data;
      this.img = new Image(this.img.data);
      this.img.src = '../../../assets/testimg_2.JPG';
    });
  }
}
