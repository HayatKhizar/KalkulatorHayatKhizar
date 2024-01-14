// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Import module HttpClient

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SQLite } from '@ionic-native/sqlite/ngx';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule], // Tambahkan HttpClientModule di sini
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLite // Pindahkan penyedia SQLite ke sini
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
