import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { IncomeExpenseService } from 'src/app/services/incomeservice/income-expense.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDateRangePicker } from '@angular/material/datepicker';

interface Category {
  id: number;
  value: string;
  transaction_type: 'income' | 'expense' | 'all';
}

interface PaymentMethod {
  id: number;
  value: string;

}

interface Transaction {
  id: number;
  pharmacy_name: string;
  chemist_id: number;
  category_id: number;
  expense_date: string;
  amount: number;
  gst_percentage: number;
  gst: number;
  total: number;
  reference_no: string;
  payment_status: number;
  expense_by_name: string;
  transaction_type: 'income' | 'expense';
  invoice_photo?: string;
}

interface DateOption {
  label: string;
  value: string;
  getDateRange?: () => { startDate: Date; endDate: Date };
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
  @ViewChild('picker') picker!: MatDateRangePicker<Date>;

  private bottomSheetRef: MatBottomSheetRef | null = null;

  data: any;
  allTransactions: Transaction[] = [];
  transactions: Transaction[] = [];
  expenseCategories: Category[] = [];
  incomeCategories: Category[] = [];
  paymentMethods: any =  [
    { id: 1, value: 'Cash' },
    { id: 3, value: 'UPI' },
    { id: null, value: 'Cheque' },
    { id: 5, value: 'Paytm' },
    { id: 6, value: 'CC/DC' },
    { id: null, value: 'RTGS/NEFT' }
  ];;
  staffList: any[] = [];

  categories:any =  [
    { id: 1, value: 'Bank fee and charges', type: 'ex' },
    { id: 2, value: 'Employee salaries & Advances', type: 'ex' },
    { id: 3, value: 'Printing and stationery', type: 'ex' },
    { id: 4, value: 'Raw material', type: 'ex' },
    { id: 5, value: 'Rent or mortgage payments', type: 'ex' },
    { id: 6, value: 'Repair & maintenances', type: 'ex' },
    { id: 7, value: 'Utilities & phone', type: 'ex' },
    { id: 8, value: 'Taxes / licenses / fees', type: 'ex' },
    { id: 9, value: 'Food & Beverage', type: 'ex' },
    { id: 15, value: 'Missing cash(cash loss)', type: 'ex' },
    { id: 10, value: 'Other', type: 'both' },
    { id: 16, value: 'Extra cash', type: 'in' },
    { id: 18, value: 'Advertisement', type: 'in' },
    { id: 19, value: 'Scrap material', type: 'in' },
    { id: 20, value: 'Any rental income', type: 'in' },
    { id: 21, value: 'Interest income', type: 'in' }
  ];;

  // Form controls and form groups
  dateFilter = new FormControl('today');
  categoryFilter = new FormControl('all');
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;

  // File upload properties
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  expenseSelectedFile: File | null = null;
  expensePreviewUrl: string | null = null;

  // Summary statistics
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  // Form groups
  incomeForm = new FormGroup({
    category: new FormControl('', Validators.required),
    incomeDate: new FormControl(new Date(), Validators.required),
    gstType: new FormControl('without_gst', Validators.required),
    gstPercentage: new FormControl({
      value: '',
      disabled: true
    }, [Validators.min(0), Validators.max(100)]),
    gstNumber: new FormControl({
      value: '',
      disabled: true
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
    partyName: new FormControl(''),
    amount: new FormControl('', [Validators.required, Validators.min(0)]),
    total: new FormControl({ value: '', disabled: true }),
    hsnCode: new FormControl(''),
    paymentMode: new FormControl('', Validators.required),
    referenceNo: new FormControl(''),
    remark: new FormControl('')
  });

  moreFiltersForm = new FormGroup({
    staff: new FormControl('all'),
    transactionType: new FormControl('all'),
    paymentMode: new FormControl('all')
  });

  // Date range form
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  // Options for dropdowns
  staffOptions = [
    { value: 'all', label: 'All' }
  ];

  transactionTypeOptions = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

  paymentModeOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All' }
  ];

  // Columns to display in the table
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

  // Date filter options
  dateOptions: DateOption[] = [
    {
      label: 'Today',
      value: 'today',
      getDateRange: () => {
        const today = new Date();
        this.loadCustomeData(1, today, today);
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
        this.loadCustomeData(1, start, end);
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

        this.loadCustomeData(1, fiscalYearStart, today);
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
        this.loadCustomeData(1, fiscalYearStart, fiscalYearEnd);
        return { startDate: fiscalYearStart, endDate: fiscalYearEnd };
      }
    },
    {
      label: 'Custom range',
      value: 'custom'
    }
  ];

  constructor(
    private bottomSheet: MatBottomSheet,
    private incomeExpenseService: IncomeExpenseService
  ) {
    // Subscribe to date range changes
    this.dateRange.valueChanges.subscribe(range => {
      if (range.start && range.end) {
        this.selectedStartDate = range.start;
        this.selectedEndDate = range.end;
        this.applyFilters();
      }
    });
  }

  ngOnInit() {
    this.loadInitialData();
    this.setupFormListeners();
  }

  private loadInitialData() {
    this.incomeExpenseService.getData(1).subscribe({
      next: (res) => {
        this.data = res;

        this.allTransactions = res.data.results;
        this.transactions = [...this.allTransactions];


        this.expenseCategories = res.data.expense_categories;
        this.incomeCategories = res.data.income_categories;

        this.paymentMethods = res.data.payment_methods;

        this.updateDropdownOptions();


        this.onDateFilterChange();
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }




  private loadCustomeData(page: number, startDate?: Date, endDate?: Date): void {
   this.incomeExpenseService.getData(1, startDate, endDate).subscribe({
      next: (response) => {
        this.data = response;
      },
      error: () => {

      }
    });
  }

  private updateDropdownOptions() {
    // Update staff options
    this.staffOptions = [
      { value: 'all', label: 'All' },
      ...this.staffList.map(staff => ({
        value: staff.id.toString(),
        label: staff.fullname
      }))
    ];

    // Update payment mode options
    this.paymentModeOptions = [
      { value: 'all', label: 'All' },
      ...this.paymentMethods.map((method:any) => ({
        value: method.value.toLowerCase(),
        label: method.value
      }))
    ];
  }



  private setupFormListeners() {
    // Income Form GST Type Listener
    this.incomeForm.get('gstType')?.valueChanges.subscribe(value => {
      this.toggleGstFields(this.incomeForm, value!);
      this.calculateTotal(this.incomeForm);
    });

    // Income Form Amount and GST Percentage Listeners
    this.incomeForm.get('amount')?.valueChanges.subscribe(() => {
      this.calculateTotal(this.incomeForm);
    });

    this.incomeForm.get('gstPercentage')?.valueChanges.subscribe(() => {
      this.calculateTotal(this.incomeForm);
    });

    // Expense Form GST Type Listener
    this.expenseForm.get('gstType')?.valueChanges.subscribe(value => {
      this.toggleGstFields(this.expenseForm, value!);
      this.calculateTotal(this.expenseForm);
    });

    // Expense Form Amount and GST Percentage Listeners
    this.expenseForm.get('amount')?.valueChanges.subscribe(() => {
      this.calculateTotal(this.expenseForm);
    });

    this.expenseForm.get('gstPercentage')?.valueChanges.subscribe(() => {
      this.calculateTotal(this.expenseForm);
    });

    // Category filter change listener
    this.categoryFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // More filters form change listener
    this.moreFiltersForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private toggleGstFields(form: FormGroup, value: string) {
    if (value === 'with_gst') {
      form.get('gstPercentage')?.enable();
      form.get('gstNumber')?.enable();
      form.get('partyName')?.enable();
      form.get('hsnCode')?.enable();
    } else {
      form.get('gstPercentage')?.disable();
      form.get('gstNumber')?.disable();
      form.get('partyName')?.disable();
      form.get('hsnCode')?.disable();

      // Reset GST-related values
      form.patchValue({
        gstPercentage: '',
        gstNumber: '',
        partyName: '',
        hsnCode: ''
      });
    }
  }

  private calculateTotal(form: FormGroup) {
    const amount = Number(form.get('amount')?.value) || 0;
    const gstType = form.get('gstType')?.value;
    const gstPercentage = Number(form.get('gstPercentage')?.value) || 0;

    let total: number;
    if (gstType === 'with_gst' && gstPercentage > 0) {
      total = amount + (amount * gstPercentage / 100);
    } else {
      total = amount;
    }

    form.get('total')?.setValue(total.toFixed(2));
  }


  // Date Filter Methods
  onDateFilterChange() {
    const selectedOption = this.dateOptions.find(
      option => option.value === this.dateFilter.value
    );

    if (selectedOption) {
      if (selectedOption.value === 'custom') {
        // Open date picker for custom range
        this.picker?.open();
      } else if (selectedOption.getDateRange) {
        const { startDate, endDate } = selectedOption.getDateRange();
        this.selectedStartDate = startDate;
        this.selectedEndDate = endDate;

        this.dateRange.patchValue({
          start: startDate,
          end: endDate
        });

        this.loadCustomeData(1, startDate, endDate);



        // Apply filters
        this.applyFilters();
      }
    }
  }


  getCategoryValue(id: number): string {
    const category = this.categories.find((cat:any) => cat.id === id);
    return category ? category.value : '';
  }

  getPaymentMethodValue(id: number | null): string {
    const method = this.paymentMethods.find((method:any) => method.id === id);
    return method ? method.method_name : '';
  }

  onDateRangeSelected(event: any) {
    if (event.value) {
      const { start, end } = event.value;
      if (start && end) {
        this.selectedStartDate = start;
        this.selectedEndDate = end;
        this.applyFilters();
      }
    }
  }

  // Bottom Sheet and Dialog Methods
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

  openFilters() {
    this.bottomSheetRef = this.bottomSheet.open(this.moreFiltersSheet, {
      panelClass: 'custom-bottom-sheet'
    });
  }

  // More Filters Methods
  resetMoreFilters() {
    this.moreFiltersForm.reset({
      staff: 'all',
      transactionType: 'all',
      paymentMode: 'all'
    });
    this.applyFilters();
  }

  applyMoreFilters() {
    this.applyFilters();
    this.closeSheet();
  }

  // File Upload Methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image file');
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
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

  // Form Submission Methods
  submitIncomeForm() {
    this.calculateTotal(this.incomeForm);

    if (this.incomeForm.valid) {
      const formValues = this.incomeForm.getRawValue();

      // Prepare transaction data
      const transactionData = {
        category_id: formValues.category,
        expense_date: formValues.incomeDate,
        amount: formValues.amount,
        total: formValues.total,
        gst_percentage: formValues.gstType === 'with_gst' ? formValues.gstPercentage : 0,
        gst: formValues.gstType === 'with_gst'
          ? (Number(formValues.amount) * Number(formValues.gstPercentage) / 100)
          : 0,
        payment_mode: formValues.paymentMode,
        reference_no: formValues.referenceNo,
        remark: formValues.remark,
        transaction_type: 'income'
      };

      this.incomeExpenseService.addData(transactionData).subscribe({
        next: (response) => {
          // Refresh data after successful submission
          this.loadInitialData();
          this.closeSheet();
        },
        error: (err) => {
          console.error('Error saving income:', err);
          // Handle error (show toast/alert)
        }
      });

      // Handle file upload if exists
      if (this.selectedFile) {
        this.uploadTransactionFile(this.selectedFile);
      }
    } else {
      // Mark form as touched to show validation errors
      Object.keys(this.incomeForm.controls).forEach(key => {
        const control = this.incomeForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  submitExpenseForm() {
    this.calculateTotal(this.expenseForm);

    if (this.expenseForm.valid) {
      const formValues = this.expenseForm.getRawValue();

      // Prepare transaction data
      const transactionData = {
        category_id: formValues.category,
        expense_date: formValues.expenseDate,
        amount: formValues.amount,
        total: formValues.total,
        gst_percentage: formValues.gstType === 'with_gst' ? formValues.gstPercentage : 0,
        gst: formValues.gstType === 'with_gst'
          ? (Number(formValues.amount) * Number(formValues.gstPercentage) / 100)
          : 0,
        payment_mode: formValues.paymentMode,
        reference_no: formValues.referenceNo,
        remark: formValues.remark,
        transaction_type: 'expense'
      };

      // Call service method to save expense
      this.incomeExpenseService.addData(transactionData).subscribe({
        next: (response) => {
          // Refresh data after successful submission
          this.loadInitialData();
          this.closeSheet();
        },
        error: (err) => {
          console.error('Error saving expense:', err);
          // Handle error (show toast/alert)
        }
      });

      // Handle file upload if exists
      if (this.expenseSelectedFile) {
        this.uploadTransactionFile(this.expenseSelectedFile);
      }
    } else {
      // Mark form as touched to show validation errors
      Object.keys(this.expenseForm.controls).forEach(key => {
        const control = this.expenseForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  // Helper method to upload transaction file
  private uploadTransactionFile(file: File) {

  }

  // Table Action Methods
  deleteTransaction(transaction: Transaction) {
    this.incomeExpenseService.deleteTransaction(transaction.id).subscribe({
      next: () => {
        // Remove transaction from local list
        this.allTransactions = this.allTransactions.filter(t => t.id !== transaction.id);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error deleting transaction:', err);
      }
    });
  }

  downloadTransaction(data: Transaction) {
if (data.invoice_photo) {
      const link = document.createElement('a');
      link.href = data.invoice_photo;
      link.target = '_blank';
      link.download = `invoice-${data.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Utility Methods
  getDisplayDate(): string {
    if (!this.selectedStartDate || !this.selectedEndDate) return '';

    return `${this.formatDate(this.selectedStartDate)} - ${this.formatDate(this.selectedEndDate)}`;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  }

  getCategoryLabel(categoryId: number, transactionType: 'income' | 'expense'): string {
    const categories = transactionType === 'income'
      ? this.incomeCategories
      : this.expenseCategories;

    const category = categories.find(c => c.id === categoryId);
    return category ? category.value : 'Unknown';
  }

  getPaymentMethodName(id: number): string {
    const method = this.paymentMethods.find((m:any) => m.id === id);
    return method ? method.value : 'Unknown';
  }

  // Filtering methods
  private applyFilters() {
    // Start with all transactions
    let filteredTransactions = [...this.allTransactions];

    // Date Range Filter
    if (this.selectedStartDate && this.selectedEndDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.expense_date);
        return transactionDate >= this.selectedStartDate! &&
               transactionDate <= this.selectedEndDate!;
      });
    }

    // Category Filter
    const selectedCategory = this.categoryFilter?.value;
    if (selectedCategory && selectedCategory !== 'all') {
      filteredTransactions = filteredTransactions.filter(t =>
        t.category_id === Number(selectedCategory)
      );
    }

    // More Filters
    const moreFilterValues = this.moreFiltersForm.value;

    // Staff Filter
    if (moreFilterValues.staff !== 'all') {
      filteredTransactions = filteredTransactions.filter(t =>
        t.expense_by_name === moreFilterValues.staff
      );
    }

    // Transaction Type Filter
    if (moreFilterValues.transactionType !== 'all') {
      filteredTransactions = filteredTransactions.filter(t =>
        t.transaction_type === moreFilterValues.transactionType
      );
    }

    // Payment Mode Filter
    if (moreFilterValues.paymentMode !== 'all') {
      filteredTransactions = filteredTransactions.filter(t =>
        this.paymentMethods.some((method:any) =>
          method.value.toLowerCase() === (moreFilterValues.paymentMode?.toLowerCase() ?? 'all')
        )
      );
    }

    // Update transactions and summary
    this.transactions = filteredTransactions;

  }
}

