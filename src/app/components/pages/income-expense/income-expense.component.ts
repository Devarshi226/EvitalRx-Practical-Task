import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';

interface DateOption {
  label: string;
  value: string;
  getDateRange?: () => { startDate: Date; endDate: Date };
}

interface Transaction {
  entryDate: string;
  category: string;
  transactionType: string;
  entryBy: string;
  paymentMode: string;
  refNo: string;
  amount: number;
  gst: number;
  total: number;
  remark: string;
}

@Component({
  selector: 'app-income-expense',
  templateUrl: './income-expense.component.html',
  styleUrls: ['./income-expense.component.scss']
})
export class IncomeExpenseComponent implements OnInit {
  @ViewChild('picker') picker!: MatDateRangePicker<Date>;

  dateFilter = new FormControl('today');
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  categoryFilter = new FormControl('all');

  categories = [
    { value: 'all', label: 'All' },
    { value: 'bank-fee', label: 'Bank Fee and Charges' },
    { value: 'employee', label: 'Employee Salaries & Advances' },
    { value: 'printing', label: 'Printing and Stationery' },
    { value: 'raw-material', label: 'Raw Material' },
    { value: 'rent', label: 'Rent or Mortgage Payments' },
    { value: 'repair', label: 'Repair & Maintenance' }
  ];

  displayedColumns: string[] = [
    'entryDate',
    'category',
    'transactionType',
    'entryBy',
    'paymentMode',
    'refNo',
    'amount',
    'gst',
    'total',
    'remark'
  ];

  transactions: Transaction[] = [
    {
      entryDate: '18-01-2025',
      category: 'Bank Fee and Charges',
      transactionType: 'Expense',
      entryBy: 'John Doe',
      paymentMode: 'Online',
      refNo: 'REF001',
      amount: 1000,
      gst: 18,
      total: 1180,
      remark: 'Annual maintenance charges'
    },
    {
      entryDate: '17-01-2025',
      category: 'Employee Salaries',
      transactionType: 'Expense',
      entryBy: 'Jane Smith',
      paymentMode: 'Bank Transfer',
      refNo: 'REF002',
      amount: 25000,
      gst: 0,
      total: 25000,
      remark: 'Monthly salary'
    }
  ];

  dateOptions: DateOption[] = [
    {
      label: 'Today',
      value: 'today',
      getDateRange: () => {
        const today = new Date();
        return { startDate: today, endDate: today };
      }
    },
    {
      label: 'Last 7 days',
      value: 'last7days',
      getDateRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        return { startDate: start, endDate: end };
      }
    },
    {
      label: 'Current fiscal year',
      value: 'currentFY',
      getDateRange: () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        let fiscalYearStart: Date;

        if (currentMonth >= 3) {
          fiscalYearStart = new Date(today.getFullYear(), 3, 1);
        } else {
          fiscalYearStart = new Date(today.getFullYear() - 1, 3, 1);
        }

        return { startDate: fiscalYearStart, endDate: today };
      }
    },
    {
      label: 'Previous fiscal year',
      value: 'previousFY',
      getDateRange: () => {
        const today = new Date();
        const fiscalYearStart = new Date(today.getFullYear() - 1, 3, 1);
        const fiscalYearEnd = new Date(today.getFullYear(), 2, 31);
        return { startDate: fiscalYearStart, endDate: fiscalYearEnd };
      }
    },
    {
      label: 'Custom range',
      value: 'custom',
      getDateRange: () => ({
        startDate: this.dateRange.get('start')?.value || new Date(),
        endDate: this.dateRange.get('end')?.value || new Date()
      })
    }
  ];

  constructor(private dialog: MatDialog) {
    // Subscribe to date range changes
    this.dateRange.valueChanges.subscribe(range => {
      if (range.start && range.end) {
        this.selectedStartDate = range.start;
        this.selectedEndDate = range.end;
      }
    });
  }

  ngOnInit() {
    this.onDateFilterChange();
  }


  getDisplayDate(): string {
    if (!this.selectedStartDate || !this.selectedEndDate) return '';

    return `${this.formatDate(this.selectedStartDate)} - ${this.formatDate(this.selectedEndDate)}`;
  }

  onDateFilterChange() {
    const selectedOption = this.dateOptions.find(
      option => option.value === this.dateFilter.value
    );

    if (selectedOption) {
      if (selectedOption.value === 'custom') {
        this.picker.open(); // Open date picker when custom is selected
      } else if (selectedOption.getDateRange) {
        const { startDate, endDate } = selectedOption.getDateRange();
        this.selectedStartDate = startDate;
        this.selectedEndDate = endDate;
      }
    }
  }

  onDateRangeSelected(event: any) {
    if (event.value) {
      const { start, end } = event.value;
      if (start && end) {
        this.selectedStartDate = start;
        this.selectedEndDate = end;
      }
    }
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  }

  openIncomeDialog() {
    // Implement income dialog
    console.log('Opening income dialog...');
  }

  openExpenseDialog() {
    // Implement expense dialog
    console.log('Opening expense dialog...');
  }

  downloadReport() {
    // Implement download functionality
    console.log('Downloading report...');
  }

  openFilters() {
    // Implement filters drawer
    console.log('Opening filters...');
  }
}
