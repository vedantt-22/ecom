import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterLink }        from '@angular/router';
import { AdminService }      from '../../core/services/admin.service';

@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls:   ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  stats:     any   = null;
  isLoading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats     = stats;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }
}