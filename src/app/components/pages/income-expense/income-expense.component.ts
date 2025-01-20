  import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
  import { IncomeExpenseService } from 'src/app/services/incomeservice/income-expense.service';
  import { FormControl, FormGroup, Validators } from '@angular/forms';
  import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
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
    @ViewChild('incomeSheet') incomeSheet!: TemplateRef<any>;
    @ViewChild('expenseSheet') expenseSheet!: TemplateRef<any>;
    @ViewChild('moreFiltersSheet') moreFiltersSheet!: TemplateRef<any>;

    private bottomSheetRef: MatBottomSheetRef | null = null;

    @ViewChild('picker') picker!: MatDateRangePicker<Date>;

    dateFilter = new FormControl('today');
    selectedStartDate: Date | null = null;
    selectedEndDate: Date | null = null;
    selectedFile: File | null = null;
    previewUrl: string | null = null;
    expenseSelectedFile: File | null = null;
    expensePreviewUrl: string | null = null;

    incomeForm = new FormGroup({
      category: new FormControl('', Validators.required),
    incomeDate: new FormControl(new Date(), Validators.required),
    gstType: new FormControl('without_gst', Validators.required),
    gstPercentage: new FormControl({
      value: '',
      disabled: true  // Initially disabled, we'll handle enable/disable in ngOnInit
    }, [Validators.min(0), Validators.max(100)]),
    gstNumber: new FormControl({
      value: '',
      disabled: true  // Initially disabled
    }, [Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]),
    partyName: new FormControl(''),
    amount: new FormControl('', [Validators.required, Validators.min(0)]),
    total: new FormControl({ value: '', disabled: true }),
    hsnCode: new FormControl(''),
    paymentMode: new FormControl('', Validators.required),
    referenceNo: new FormControl(''),
    remark: new FormControl('')
    });

    expenseForm = new FormGroup({
      category: new FormControl('', Validators.required),
      expenseDate: new FormControl(new Date(), Validators.required),
      paymentDate: new FormControl(new Date(), Validators.required),
      gstType: new FormControl('without_gst', Validators.required),
      gstPercentage: new FormControl({ value: '', disabled: true }, [Validators.min(0), Validators.max(100)]),
      gstNumber: new FormControl({ value: '', disabled: true }, [
        Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')
      ]),
      partyName: new FormControl({ value: '', disabled: true }),
      amount: new FormControl('', [Validators.required, Validators.min(0)]),
      total: new FormControl({ value: '', disabled: true }),
      hsnCode: new FormControl({ value: '', disabled: true }),
      paymentMode: new FormControl('', Validators.required),
      referenceNo: new FormControl(''),
      remark: new FormControl('')
    });

    moreFiltersForm = new FormGroup({
      staff: new FormControl('all'),
      transactionType: new FormControl('all'),
      paymentMode: new FormControl('all')
    });

    staffOptions = [
      { value: 'all', label: 'All' },
      { value: 'owner', label: 'Owner' }
    ];

    transactionTypeOptions = [
      { value: 'all', label: 'All' },
      { value: 'income', label: 'Income' },
      { value: 'expense', label: 'Expense' }
    ];

    paymentModeOptions = [
      { value: 'all', label: 'All' },
      { value: 'cash', label: 'Cash' },
      { value: 'upi', label: 'UPI' },
      { value: 'cheque', label: 'Cheque' },
      { value: 'paytm', label: 'Paytm' }
    ];

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
      'remark',
      'actions'
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

    constructor(private dialog: MatDialog, private bottomSheet: MatBottomSheet, private IncomeExpense : IncomeExpenseService) {
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


      // Enable/Disable GST fields based on GST type
    this.incomeForm.get('gstType')?.valueChanges.subscribe(value => {
      if (value === 'with_gst') {
        this.incomeForm.get('gstPercentage')?.enable();
        this.incomeForm.get('gstNumber')?.enable();
      } else {
        this.incomeForm.get('gstPercentage')?.disable();
        this.incomeForm.get('gstNumber')?.disable();
        // Reset GST-related values when switching to without GST
        this.incomeForm.patchValue({
          gstPercentage: '',
          gstNumber: ''
        });
      }
      this.calculateTotal(); // Recalculate total when GST type changes
    });

    // Subscribe to amount and GST changes to calculate total
    this.incomeForm.get('amount')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });

    this.incomeForm.get('gstPercentage')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });

    // Income Form GST Type and Calculation Listeners
  this.incomeForm.get('gstType')?.valueChanges.subscribe(value => {
    if (value === 'with_gst') {
      this.incomeForm.get('gstPercentage')?.enable();
      this.incomeForm.get('gstNumber')?.enable();
    } else {
      this.incomeForm.get('gstPercentage')?.disable();
      this.incomeForm.get('gstNumber')?.disable();
      this.incomeForm.get('gstPercentage')?.setValue(null);
    }
    this.calculateTotal();
  });

  this.incomeForm.get('amount')?.valueChanges.subscribe(() => {
    this.calculateTotal();
  });

  this.incomeForm.get('gstPercentage')?.valueChanges.subscribe(() => {
    this.calculateTotal();
  });

  // Similar setup for Expense Form
  this.expenseForm.get('gstType')?.valueChanges.subscribe(value => {
    if (value === 'with_gst') {
      this.expenseForm.get('gstPercentage')?.enable();
      this.expenseForm.get('gstNumber')?.enable();
    } else {
      this.expenseForm.get('gstPercentage')?.disable();
      this.expenseForm.get('gstNumber')?.disable();
      this.expenseForm.get('gstPercentage')?.setValue(null);
    }
    this.calculateExpenseTotal();
  });

  this.expenseForm.get('amount')?.valueChanges.subscribe(() => {
    this.calculateExpenseTotal();
  });

  this.expenseForm.get('gstPercentage')?.valueChanges.subscribe(() => {
    this.calculateExpenseTotal();
  });

    // Handle GST type changes
    this.incomeForm.get('gstType')?.valueChanges.subscribe(value => {
      if (value === 'with_gst') {
        this.incomeForm.get('gstPercentage')?.enable();
        this.incomeForm.get('gstNumber')?.enable();
        this.incomeForm.get('partyName')?.enable();
        this.incomeForm.get('hsnCode')?.enable();
      } else {
        this.incomeForm.get('gstPercentage')?.disable();
        this.incomeForm.get('gstNumber')?.disable();
        this.incomeForm.get('partyName')?.disable();
        this.incomeForm.get('hsnCode')?.disable();
        // Reset values
        this.incomeForm.patchValue({
          gstPercentage: '',
          gstNumber: '',
          partyName: '',
          hsnCode: ''
        });
      }
      this.calculateTotal();
    });


    // for expense form
    this.expenseForm.get('gstType')?.valueChanges.subscribe(value => {
      if (value === 'with_gst') {
        this.expenseForm.get('gstPercentage')?.enable();
        this.expenseForm.get('gstNumber')?.enable();
        this.expenseForm.get('partyName')?.enable();
        this.expenseForm.get('hsnCode')?.enable();
      } else {
        this.expenseForm.get('gstPercentage')?.disable();
        this.expenseForm.get('gstNumber')?.disable();
        this.expenseForm.get('partyName')?.disable();
        this.expenseForm.get('hsnCode')?.disable();
        this.expenseForm.patchValue({
          gstPercentage: '',
          gstNumber: '',
          partyName: '',
          hsnCode: ''
        });
      }
      this.calculateExpenseTotal();
    });

    this.expenseForm.get('amount')?.valueChanges.subscribe(() => {
      this.calculateExpenseTotal();
    });

    this.expenseForm.get('gstPercentage')?.valueChanges.subscribe(() => {
      this.calculateExpenseTotal();
    });

    }

    private calculateTotal() {
      const amount = Number(this.incomeForm.get('amount')?.value) || 0;
      const gstType = this.incomeForm.get('gstType')?.value;
      const gstPercentage = Number(this.incomeForm.get('gstPercentage')?.value) || 0;

      let total: number;
      if (gstType === 'with_gst' && gstPercentage > 0) {
        // Calculate total including GST
        total = amount + (amount * gstPercentage / 100);
      } else {
        // If no GST or GST type is without_gst
        total = amount;
      }

      // Always set the total, rounded to 2 decimal places
      this.incomeForm.get('total')?.setValue(total.toFixed(2));
    }

    private calculateExpenseTotal() {
      const amount = Number(this.expenseForm.get('amount')?.value) || 0;
      const gstType = this.expenseForm.get('gstType')?.value;
      const gstPercentage = Number(this.expenseForm.get('gstPercentage')?.value) || 0;

      let total: number;
      if (gstType === 'with_gst' && gstPercentage > 0) {
        // Calculate total including GST
        total = amount + (amount * gstPercentage / 100);
      } else {
        // If no GST or GST type is without_gst
        total = amount;
      }

      // Always set the total, rounded to 2 decimal places
      this.expenseForm.get('total')?.setValue(total.toFixed(2));
    }


    onFileSelected(event: any): void {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        this.selectedFile = file;
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // Show error if file is not an image
        alert('Please select an image file');
      }
    }

    removeFile(event: Event): void {
      event.stopPropagation(); // Prevent triggering file input click
      this.selectedFile = null;
      this.previewUrl = null;
    }

    onExpenseFileSelected(event: any): void {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        this.expenseSelectedFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.expensePreviewUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file');
      }
    }

    removeExpenseFile(event: Event): void {
      event.stopPropagation();
      this.expenseSelectedFile = null;
      this.expensePreviewUrl = null;
    }


    getDisplayDate(): string {
      if (!this.selectedStartDate || !this.selectedEndDate) return '';

      return `${this.formatDate(this.selectedStartDate)} - ${this.formatDate(this.selectedEndDate)}`;
    }

    // onDateFilterChange() {
    //   const selectedOption = this.dateOptions.find(
    //     option => option.value === this.dateFilter.value
    //   );

    //   if (selectedOption) {
    //     if (selectedOption.value === 'custom') {
    //       this.picker.open(); // Open date picker when custom is selected
    //     } else if (selectedOption.getDateRange) {
    //       const { startDate, endDate } = selectedOption.getDateRange();
    //       this.selectedStartDate = startDate;
    //       this.selectedEndDate = endDate;
    //     }
    //   }
    // }

    onDateFilterChange() {
      const selectedOption = this.dateOptions.find(
        option => option.value === this.dateFilter.value
      );

      if (selectedOption) {
        if (selectedOption.value === 'custom') {
          // Handle custom date selection
        } else if (selectedOption.getDateRange) {
          const { startDate, endDate } = selectedOption.getDateRange();
          this.selectedStartDate = startDate;
          this.selectedEndDate = endDate;

          // Update date range form controls
          this.dateRange.patchValue({
            start: startDate,
            end: endDate
          });
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
      this.bottomSheetRef = this.bottomSheet.open(this.incomeSheet, {
        panelClass: 'custom-bottom-sheet'
      });
    }

    openExpenseDialog() {
      this.bottomSheetRef = this.bottomSheet.open(this.expenseSheet, {
        panelClass: 'custom-bottom-sheet'
      });
    }

    closeSheet() {
      if (this.bottomSheetRef) {
        this.bottomSheetRef.dismiss();
        this.bottomSheetRef = null;
      }
    }

    downloadReport() {
      // Implement download functionality
      console.log('Downloading report...');
    }

    openFilters() {
      this.bottomSheetRef = this.bottomSheet.open(this.moreFiltersSheet, {
        panelClass: 'custom-bottom-sheet'
      });
    }

    // Method to reset More Filters form
  resetMoreFilters() {
    this.moreFiltersForm.reset({
      staff: 'all',
      transactionType: 'all',
      paymentMode: 'all'
    });
  }

  // Method to apply More Filters
  applyMoreFilters() {
    const filterValues = this.moreFiltersForm.value;
    console.log('Applied More Filters:', filterValues);

    // Here you would typically implement the actual filtering logic
    // For now, we'll just log the selected filters
    this.closeSheet();
  }

  submitIncomeForm() {
    this.calculateTotal();

    if (this.incomeForm.valid) {
      const formValues = this.incomeForm.getRawValue();
      console.log('Income Form Values:', {
        category: formValues.category,
        incomeDate: formValues.incomeDate,
        gstType: formValues.gstType,
        gstPercentage: formValues.gstPercentage,
        gstNumber: formValues.gstNumber,
        partyName: formValues.partyName,
        amount: formValues.amount,
        total: formValues.total,
        hsnCode: formValues.hsnCode,
        paymentMode: formValues.paymentMode,
        referenceNo: formValues.referenceNo,
        remark: formValues.remark
      });

      if (this.selectedFile) {
        console.log('Income Form Attachment:', {
          fileName: this.selectedFile.name,
          fileType: this.selectedFile.type,
          fileSize: `${(this.selectedFile.size / 1024).toFixed(2)} KB`
        });
      }

      this.closeSheet();
    } else {
      console.log('Income Form Validation Errors:', this.getFormValidationErrors(this.incomeForm));
    }
  }

  submitExpenseForm() {// Ensure total is calculated before submission
    this.calculateExpenseTotal();

    if (this.expenseForm.valid) {
      const formValues = this.expenseForm.getRawValue();
      console.log('Expense Form Values:', {
        category: formValues.category,
        expenseDate: formValues.expenseDate,
        paymentDate: formValues.paymentDate,
        gstType: formValues.gstType,
        gstPercentage: formValues.gstPercentage,
        gstNumber: formValues.gstNumber,
        partyName: formValues.partyName,
        amount: formValues.amount,
        total: formValues.total,
        hsnCode: formValues.hsnCode,
        paymentMode: formValues.paymentMode,
        referenceNo: formValues.referenceNo,
        remark: formValues.remark
      });

      if (this.expenseSelectedFile) {
        console.log('Expense Form Attachment:', {
          fileName: this.expenseSelectedFile.name,
          fileType: this.expenseSelectedFile.type,
          fileSize: `${(this.expenseSelectedFile.size / 1024).toFixed(2)} KB`
        });
      }

      this.closeSheet();
    } else {
      console.log('Expense Form Validation Errors:', this.getFormValidationErrors(this.expenseForm));
    }}

    // Helper method to get form validation errors
    private getFormValidationErrors(form: FormGroup) {
      const errors: any = {};
      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);
        if (control?.errors) {
          errors[key] = control.errors;
        }
      });
      return errors;
    }



// Add these methods to handle actions
deleteTransaction(element: Transaction) {
  console.log('Deleting transaction:', element);
  // Implement your delete logic here
  const index = this.transactions.indexOf(element);
  if (index > -1) {
    this.transactions = this.transactions.filter(t => t !== element);
  }
}

downloadTransaction(element: Transaction) {
  console.log('Downloading transaction:', element);
  // Implement your download logic here
}
  }
