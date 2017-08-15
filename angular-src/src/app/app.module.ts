import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { ImgService } from './services/img.service';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ImgComponent } from './components/img/img.component';
import { HomeComponent } from './components/home/home.component';
import { TestComponent } from './components/test/test.component';

const appRoutes : Routes = [
  {path : '', component : HomeComponent},
  {path : 'api/face', component : DashboardComponent},
  {path : 'api/test', component : TestComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ImgComponent,
    HomeComponent,
    TestComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    HttpModule
  ],
  providers: [ImgService],
  bootstrap: [AppComponent]
})
export class AppModule { }
