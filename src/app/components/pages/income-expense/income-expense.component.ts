import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { IncomeExpenseService } from 'src/app/services/incomeservice/income-expense.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';





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
  hsn_sac_code: '0000'
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

  selectedRow: any = null;
  data: any;
  allTransactions: Transaction[] = [];
  transactions: Transaction[] = [];
  expenseCategories: any = [];
  incomeCategories:  any = [];
  paymentMethods: any =  [];

  // paymentMethods: any =  [
  //   { id: 1, value: 'Cash' },
  //   { id: 3, value: 'UPI' },
  //   { id: null, value: 'Cheque' },
  //   { id: 5, value: 'Paytm' },
  //   { id: 6, value: 'CC/DC' },
  //   { id: null, value: 'RTGS/NEFT' }
  // ];;
  staffList: any[] = [];

  categories:any =  [
    // { id: 1, value: 'Bank fee and charges' },
    // { id: 2, value: 'Employee salaries & Advances' },
    // { id: 3, value: 'Printing and stationery' },
    // { id: 4, value: 'Raw material' },
    // { id: 5, value: 'Rent or mortgage payments' },
    // { id: 6, value: 'Repair & maintenances' },
    // { id: 7, value: 'Utilities & phone' },
    // { id: 8, value: 'Taxes / licenses / fees' },
    // { id: 9, value: 'Food & Beverage' },
    // { id: 15, value: 'Missing cash(cash loss)' },
    // { id: 10, value: 'Other' },
    // { id: 16, value: 'Extra cash' },
    // { id: 18, value: 'Advertisement' },
    // { id: 19, value: 'Scrap material' },
    // { id: 20, value: 'Any rental income' },
    // { id: 21, value: 'Interest income' }
  ];;

  // Form controls and form groups
  dateFilter = new FormControl('today');
  categoryFilter = new FormControl('all');
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  maxDate = new Date();

  // File upload properties
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  expenseSelectedFile: File | null = null;
  expensePreviewUrl: string | null = null;

  // Summary statistics
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  //page
  currentPage = 1;



  // Form groups
  incomeForm = new FormGroup({
    category: new FormControl('', Validators.required),
    incomeDate: new FormControl(new Date(), Validators.required),
    gstType: new FormControl('without_gst', Validators.required),
    gstPercentage: new FormControl({
      value: '',
      disabled: true
    }, [
      Validators.pattern('^[0-9]{1,2}$'),  // This ensures only 1-2 digits
      Validators.max(99)
    ]),
    gstNumber: new FormControl({
      value: '',
      disabled: true
    }, [
      // This pattern ensures only numbers and CAPITAL letters
      Validators.pattern('^[0-9A-Z]{15}$')
    ]),
    partyName: new FormControl(''),
    amount: new FormControl('', [
      Validators.required,
      Validators.min(0),
      Validators.pattern('^[0-9]*$')  // Only positive numbers
    ]),
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
    gstPercentage: new FormControl({
      value: '',
      disabled: true
    }, [
      Validators.pattern('^[0-9]{1,2}$'),
      Validators.max(99)
    ]),
    gstNumber: new FormControl({
      value: '',
      disabled: true
    }, [
      Validators.pattern('^[0-9A-Z]{15}$')
    ]),
    partyName: new FormControl(''),
    amount: new FormControl('', [
      Validators.required,
      Validators.min(0),
      Validators.pattern('^[0-9]*$')
    ]),
    total: new FormControl({ value: '', disabled: true }),
    hsnCode: new FormControl(''),
    // hsnCode: new FormControl(''),
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

  staffOptions:any = [
    { value: 'all', label: 'All' },
    { value: 'Owner', label: 'Owner' }
  ];

  transactionTypeOptions = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
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

        const currentYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
        const fiscalYearStart = new Date(currentYear, 3, 1);
        const fiscalYearEnd = new Date(currentYear + 1, 2, 31);

        this.loadCustomeData(1, fiscalYearStart, fiscalYearEnd);
        return { startDate: fiscalYearStart, endDate: fiscalYearEnd };
      }
    },
    {
      label: 'Previous fiscal year',
      value: 'previousFY',
      getDateRange: () => {
        const today = new Date();
        const prevYear = today.getMonth() >= 3 ? today.getFullYear() - 1 : today.getFullYear() - 2;
        const fiscalYearStart = new Date(prevYear, 3, 1);
        const fiscalYearEnd = new Date(prevYear + 1, 2, 31);
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
    private incomeExpenseService: IncomeExpenseService,
    private toster: ToastrService
  ) {
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



 loadInitialData() {
    this.incomeExpenseService.getData(1).subscribe({
      next: (res) => {
        this.data = res;

        this.allTransactions = res.data.results;
        this.transactions = [...this.allTransactions];


        this.expenseCategories = res.data.expense_categories;
        this.incomeCategories = res.data.income_categories;
        this.categories = [...res.data.expense_categories, ...res.data.income_categories];

        this.paymentMethods = res.data.payment_methods;



        this.onDateFilterChange();
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  numberOnly(event: KeyboardEvent): boolean {
    const inputChar = String.fromCharCode(event.charCode);

    if (!/^[0-9]$/.test(inputChar)) {
      event.preventDefault();
      return false;
    }
    return true;
  }


   loadCustomeData(page: number, startDate?: Date, endDate?: Date): void {
    this.incomeExpenseService.getData(page, startDate, endDate).subscribe({
      next: (response) => {

          this.data = response;
          if (this.data?.data?.results) {
              this.transactions = [...this.data.data.results];
              this.allTransactions = [...this.data.data.results];
          }
      },
      error: (error) => {
          console.error('Error loading data:', error);
      }
  });
  }

 setupFormListeners() {

    this.categoryFilter.valueChanges.subscribe((value) => {
      if (this.data?.data?.results) {
          let filteredData = [...this.data.data.results];

          if (value && value !== 'all') {
              filteredData = filteredData.filter(item =>
                  item.category_id === Number(value)
              );
          }

          this.transactions = filteredData;
      }
  });

    this.incomeForm.get('gstType')?.valueChanges.subscribe(value => {
      this.toggleGstFields(this.incomeForm, value!);
      this.calculateTotal(this.incomeForm);
    });

    this.incomeForm.get('amount')?.valueChanges.subscribe(() => {
      this.calculateTotal(this.incomeForm);
    });

    this.incomeForm.get('gstPercentage')?.valueChanges.subscribe(() => {
      this.calculateTotal(this.incomeForm);
    });

    this.expenseForm.get('gstType')?.valueChanges.subscribe(value => {
      this.toggleGstFields(this.expenseForm, value!);
      this.calculateTotal(this.expenseForm);
    });

    this.expenseForm.get('amount')?.valueChanges.subscribe(() => {
      this.calculateTotal(this.expenseForm);
    });

    this.expenseForm.get('gstPercentage')?.valueChanges.subscribe(() => {
      this.calculateTotal(this.expenseForm);
    });

    this.categoryFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.moreFiltersForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

 toggleGstFields(form: FormGroup, value: string) {
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

      form.patchValue({
        gstPercentage: '',
        gstNumber: '',
        partyName: '',
        hsnCode: ''
      });
    }
  }

 calculateTotal(form: FormGroup) {
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

  onDateFilterChange() {
    const selectedOption = this.dateOptions.find(
        option => option.value === this.dateFilter.value
    );

    if (selectedOption) {
        if (selectedOption.value === 'custom') {
            this.picker?.open();
        } else if (selectedOption.getDateRange) {
            const { startDate, endDate } = selectedOption.getDateRange();
            this.selectedStartDate = startDate;
            this.selectedEndDate = endDate;

            this.loadCustomeData(1, startDate, endDate);
        }
    }
}


  getCategoryValue(id: number): string {
    const category = this.categories.find((cat:any) => cat.id === id);
    return category ? category.category : '';
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
            this.loadCustomeData(1, start, end);
        }
    }
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

  openFilters() {
     this.bottomSheetRef = this.bottomSheet.open(this.moreFiltersSheet, {
    panelClass: 'custom-bottom-sheet',
    hasBackdrop: true,
    disableClose: false
});
this.bottomSheetRef.afterDismissed().subscribe(() => {
    this.bottomSheetRef = null;
});
  }


  applyMoreFilters() {
    this.applyFilters();
    this.closeSheet();
  }

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
    if (!this.incomeForm.valid) {
      const controls = this.incomeForm.controls;

      if (!controls.category.valid) {
        this.toster.error('Please select a category');
        return;
      }

      if (!controls.incomeDate.valid) {
        this.toster.error('Please select income date');
        return;
      }

      if (!controls.amount.valid) {
        if (controls.amount.errors?.['required']) {
          this.toster.error('Please enter amount');
        } else if (controls.amount.errors?.['min']) {
          this.toster.error('Amount must be greater than 0');
        }
        return;
      }

      if (!controls.paymentMode.valid) {
        this.toster.error('Please select payment mode');
        return;
      }

      if (controls.gstType.value === 'with_gst') {
        if (controls.gstPercentage.enabled && !controls.gstPercentage.valid) {
          if (controls.gstPercentage.errors?.['min'] || controls.gstPercentage.errors?.['max']) {
            this.toster.error('GST percentage must be between 0 and 100');
          }
          return;
        }

        if (controls.gstNumber.enabled && !controls.gstNumber.valid) {
          this.toster.error('Please enter valid GST number');
          return;
        }

        if (controls.hsnCode.value === '') {
          this.toster.error('Please enter HSN/SAC code');
          return;
        }
      }

      return;
    }

    this.calculateTotal(this.incomeForm);
    const formValues = this.incomeForm.getRawValue();

    const transactionData = {
      category_id: formValues.category,
      expense_date: formValues.incomeDate,
      amount: formValues.amount,
      total: formValues.total,
      gst_percentage: formValues.gstType === 'with_gst' ? formValues.gstPercentage : 0,
      gstn_number: formValues.gstNumber,
      hsn_sac_code: formValues.hsnCode,
      payment_mode: formValues.paymentMode,
      reference_no: formValues.referenceNo,
      remark: formValues.remark,
      transaction_type: 'income',
      document: this.selectedFile
    };





    this.incomeExpenseService.addData(transactionData).subscribe({
      next: (response) => {
        if (response.status_code === "1") {
          this.toster.success('Income saved successfully');
          this.loadInitialData();
          this.incomeForm.reset()
          this.closeSheet();
        } else {
          this.toster.error('Error saving expense', response.message);
        }
      },
      error: (err) => {
        console.error('Error saving income:', err);
        this.toster.error('Error saving income. Please try again.');
      }
    });


  }


  submitExpenseForm() {
    if (!this.expenseForm.valid) {
      const controls = this.expenseForm.controls;

      if (!controls.category.valid) {
        this.toster.error('Please select an expense category');
        return;
      }

      if (!controls.expenseDate.valid) {
        this.toster.error('Please select expense date');
        return;
      }

      if (!controls.paymentDate.valid) {
        this.toster.error('Please select payment date');
        return;
      }

      if (!controls.amount.valid) {
        if (controls.amount.errors?.['required']) {
          this.toster.error('Please enter amount');
        } else if (controls.amount.errors?.['min']) {
          this.toster.error('Amount must be greater than 0');
        }
        return;
      }

      if (!controls.paymentMode.valid) {
        this.toster.error('Please select payment mode');
        return;
      }

      if (controls.gstType.value === 'with_gst') {
        if (controls.gstPercentage.enabled && !controls.gstPercentage.valid) {
          if (controls.gstPercentage.errors?.['min'] || controls.gstPercentage.errors?.['max']) {
            this.toster.error('GST percentage must be between 0 and 100');
          }
          return;
        }

        if (controls.gstNumber.enabled && !controls.gstNumber.valid) {
          this.toster.error('Please enter valid GST number');
          return;
        }
      }

      return;
    }

    this.calculateTotal(this.expenseForm);

    const formValues = this.expenseForm.getRawValue();

    const transactionData = {
      category_id: formValues.category,
      payment_date: formValues.paymentDate,
      expense_date: formValues.expenseDate,
      amount: formValues.amount,
      total: formValues.total,
      gst_percentage: formValues.gstType === 'with_gst' ? formValues.gstPercentage : 0,
      gst: formValues.gstType === 'with_gst'
        ? (Number(formValues.amount) * Number(formValues.gstPercentage) / 100)
        : 0,
      gstn_number: formValues.gstNumber,
      party_name: formValues.partyName,
      payment_mode: formValues.paymentMode,
      reference_no: formValues.referenceNo,
      remark: formValues.remark,
      transaction_type: 'expense',
      document: this.selectedFile
    };

    this.incomeExpenseService.addData(transactionData).subscribe({
      next: (response) => {
        if (response.status_code === "1") {
          this.toster.success('Expense saved successfully');
          this.loadInitialData();
          this.expenseForm.reset()
          this.closeSheet();
        } else {
          this.toster.error('Error saving expense', response.message);
        }
      },
      error: (err) => {
        console.error('Error saving expense:', err);
        this.toster.error('Error saving expense. Please try again.');
      }
    });

  }


  deleteTransaction(transaction: Transaction) {


    Swal.fire({
      title: 'Are you sure?',
      text: 'This transaction will be deleted permanently',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1597c1',
      cancelButtonColor: '#232a49',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.incomeExpenseService.deleteTransaction(transaction.id).subscribe({
          next: () => {
            this.toster.success('Transaction deleted successfully!', 'Success');
            this.allTransactions = this.allTransactions.filter(t => t.id !== transaction.id);
            this.loadCustomeData(this.currentPage, this.selectedStartDate ?? undefined, this.selectedEndDate ?? undefined);
        this.applyFilters();
          },
          error: () => {
            this.toster.error('Error deleting transaction', 'Error');
          }
        });
      }
    });
  }

  downloadTransaction(transaction: Transaction) {

    if (transaction.invoice_photo) {
      const link = document.createElement('a');
      link.href = transaction.invoice_photo;
      link.target = '_blank';
      link.download = `invoice-${transaction.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }




  downloadTransactionsPdf() {
    if (!this.transactions || !Array.isArray(this.transactions)) {
      console.error('No transaction data available');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.text('Transaction Report', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    const formatCurrency = (amount: number) => {
      return `₹${amount.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      })}`;
    };

    const tableData = this.transactions.map((item: any) => [
      item.expense_date,
      this.getCategoryValue(item.category_id),
      item.transaction_type,
      item.expense_by_name,
      this.getPaymentMethodValue(item.payment_status),
      item.reference_no,
      item.amount ,
      `${item.gst_percentage}%`,
      item.total,
      item.description || ''
    ]);

    const totals = this.transactions.reduce((acc: any, item: any) => {
      acc.amount = this.data.data.total_income || 0;
      acc.total = this.data.data.total_amount || 0;
      return acc;
    }, { amount: 0, total: 0 });

    // Add total row
    tableData.push([
      '', '', '', '', '', 'Total:',
      formatCurrency(totals.amount),
      '',
      formatCurrency(totals.total),
      ''
    ]);

    // Configure and add the table
    autoTable(doc, {
      head: [['Entry Date', 'Category', 'Transaction Type', 'Entry By', 'Payment Mode', 'Ref. No', 'Amount', 'GST (%)', 'Total', 'Remarks']],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [71, 71, 71],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      columnStyles: {
        6: { halign: 'right' },
        8: { halign: 'right' },
      },
      didDrawPage: (data) => {
        const pageCount = this.currentPage;
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      },
      margin: { top: 30 },
    });

    const timestamp = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.text(`Generated: ${timestamp}`, 14, doc.internal.pageSize.getHeight() - 10);

    const fileName = `transactions_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(fileName);
  }



  getDisplayDate(): string {
    if (!this.selectedStartDate || !this.selectedEndDate) return '';

    return `${this.formatDate(this.selectedStartDate)} - ${this.formatDate(this.selectedEndDate)}`;
  }

 formatDate(date: Date): string {
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

    const category = categories.find((c:any) => c.id === categoryId);
    return category ? category.value : 'Unknown';
  }

  getPaymentMethodName(id: number): string {
    const method = this.paymentMethods.find((m:any) => m.id === id);
    return method ? method.value : 'Unknown';
  }



 applyFilters() {
  if (!this.allTransactions) return;

  let filteredTransactions = [...this.allTransactions];
  let totalIncome = 0;
  let totalExpense = 0;

  if (this.selectedStartDate && this.selectedEndDate) {
      filteredTransactions = filteredTransactions.filter(t => {
          const transactionDate = new Date(t.expense_date);
          const startDate = new Date(this.selectedStartDate!);
          const endDate = new Date(this.selectedEndDate!);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          return transactionDate >= startDate && transactionDate <= endDate;
      });
  }

  const selectedCategory = this.categoryFilter.value;
  if (selectedCategory && selectedCategory !== 'all') {
      filteredTransactions = filteredTransactions.filter(t =>
          t.category_id === Number(selectedCategory)
      );
  }

  const moreFilterValues = this.moreFiltersForm.value;

  if (moreFilterValues.staff && moreFilterValues.staff !== 'all') {
      filteredTransactions = filteredTransactions.filter(t =>
          t.expense_by_name === moreFilterValues.staff
      );
  }

  if (moreFilterValues.transactionType && moreFilterValues.transactionType !== 'all') {
      filteredTransactions = filteredTransactions.filter(t =>
          t.transaction_type === moreFilterValues.transactionType
      );

      if (moreFilterValues.transactionType === 'income') {
          totalIncome = filteredTransactions.reduce((sum, t) => sum + (+t.amount), 0);
          totalExpense = 0;
      } else if (moreFilterValues.transactionType === 'expense') {
          totalExpense = filteredTransactions.reduce((sum, t) => sum + (+t.amount), 0);
          totalIncome = 0;
      }
  } else {
      totalIncome = filteredTransactions
          .filter(t => t.transaction_type === 'income')
          .reduce((sum, t) => sum + (+t.amount), 0);
      totalExpense = filteredTransactions
          .filter(t => t.transaction_type === 'expense')
          .reduce((sum, t) => sum + (+t.amount), 0);
  }

  if (moreFilterValues.paymentMode && moreFilterValues.paymentMode !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => {
          const method = this.paymentMethods.find((m: { id: number | null; value: string }) =>
              m.id === t.payment_status
          );
          return method && moreFilterValues.paymentMode ?
              method.id === +moreFilterValues.paymentMode :
              false;
      });
  }

  this.data = {
      ...this.data,
      data: {
          ...this.data?.data,
          total_income: totalIncome,
          total_expense: totalExpense,
          total_amount: totalIncome - totalExpense
      }
  };

  this.transactions = filteredTransactions;
}

resetMoreFilters(): void {
  this.moreFiltersForm.reset({
      staff: 'all',
      transactionType: 'all',
      paymentMode: 'all'
  });

  if (this.data?.data?.results) {
      this.transactions = [...this.data.data.results];
  }
}


changePage(page: number) {
  this.currentPage = page;
  this.loadCustomeData(page, this.selectedStartDate ?? undefined, this.selectedEndDate ?? undefined);
}

}

