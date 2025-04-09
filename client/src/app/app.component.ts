import { RouterOutlet } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { io } from 'socket.io-client';
@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  healthRecordCount = 0;
  healthDefectsCount = 0;
  healthRecords: any[] = [];
  healthDefects: any[] = [];
  socket: any;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.socket = io('http://localhost:3000');

    // Listen for new data
    this.socket.on('normalData', (data: any) => {
      this.healthRecordCount++;
      this.healthRecords.unshift(data);
      // if (this.healthRecords.length > 50) this.healthRecords.pop(); // Limit data if needed
    });
    this.socket.on('riskData', (data: any) => {
      this.healthDefectsCount++;
      this.healthDefects.unshift(data);
      // if (this.healthRecords.length > 50) this.healthRecords.pop(); // Limit data if needed
    });

    this.fetchNormalRecords();
    this.fetchRiskRecords();
  }

  fetchNormalRecords() {
    this.http.get<any[]>('http://localhost:3000/data').subscribe(data => {
      this.healthRecords = data;
      this.healthRecordCount = data.length;
    });
  }
  fetchRiskRecords() {
    this.http.get<any[]>('http://localhost:3000/risk').subscribe(data => {
      this.healthDefects = data;
      this.healthDefectsCount = data.length;
    });
  }
}