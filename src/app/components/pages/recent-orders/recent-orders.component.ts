import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-recent-orders',
  templateUrl: './recent-orders.component.html',
  styleUrls: ['./recent-orders.component.scss']
})
export class RecentOrdersComponent implements OnInit {
  recentOrders: any[] = [];

  statusColors = {
    pending: { color: '#EAB308', background: 'rgba(234, 179, 8, 0.1)' },
    processing: { color: '#6366F1', background: 'rgba(99, 102, 241, 0.1)' },
    delivered: { color: '#22C55E', background: 'rgba(34, 197, 94, 0.1)' },
    cancelled: { color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)' }
  };

  constructor() {
    this.recentOrders = [
      {
        order_id: 'ORD123456',
        order_number: 'ON987654',
        order_date: new Date('2024-03-20'),
        pharmacy_name: 'MedPlus Pharmacy',
        total_amount: 2599,
        delivery_address: '123 Main Street, Mumbai, Maharashtra',
        status: { status: 'delivered', color: this.statusColors.delivered.color },
        items: 3
      },
      {
        order_id: 'ORD123457',
        order_number: 'ON987655',
        order_date: new Date('2024-03-19'),
        pharmacy_name: 'Apollo Pharmacy',
        total_amount: 1899,
        delivery_address: '456 Park Avenue, Delhi, Delhi',
        status: { status: 'processing', color: this.statusColors.processing.color },
        items: 2
      },
      {
        order_id: 'ORD123458',
        order_number: 'ON987656',
        order_date: new Date('2024-03-18'),
        pharmacy_name: 'Wellness Forever',
        total_amount: 3299,
        delivery_address: '789 Lake View, Bangalore, Karnataka',
        status: { status: 'pending', color: this.statusColors.pending.color },
        items: 4
      }
    ];
  }

  ngOnInit(): void {}

  getStatusStyle(status: string) {
    const statusConfig = this.statusColors[status as keyof typeof this.statusColors];
    return {
      color: statusConfig.color,
      background: statusConfig.background
    };
  }

  viewOrderDetails(orderId: string) {
    console.log('View order details for order ID:', orderId);}
}
