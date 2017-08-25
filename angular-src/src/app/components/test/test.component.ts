import { Component, OnInit } from '@angular/core';
import {ImgService } from '../../services/img.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  image : any;

  constructor(private imgService : ImgService) { }

  ngOnInit() {
    this.imgService.getTestImage().subscribe(data => {
      console.log(data.data);
      this.image = data.data;
      this.image = "data:image/png;base64," + window.btoa(this.image);
    });
  }
}
