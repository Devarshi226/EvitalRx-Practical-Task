import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { EvitalApiService } from 'src/app/services/evitalrx/evital-api.service';
import { ShareddataService } from 'src/app/services/shareddata/shareddata.service';
import { ViewDetailsComponent } from '../view-details/view-details.component';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('filterDrawer') filterDrawer: any;


  searchQuery: string = '';
  selectedMedicine: string = '';
  suggestions: string | null = null;
  searchSubject = new Subject<string>();

  sortOption: string = 'relevance';
  showSuggestions: boolean = false;
  isLoading: boolean = false;

  categories: string[] = [
    'All Medicines',
    'Prescription Drugs',
    'Over-the-Counter',
    'Vitamins & Supplements',
    'Healthcare Devices',
    'Personal Care',
    'Ayurvedic',
    'Homeopathy'
  ];

  selectedCategories: string[] = [];
  priceRange: [number, number] = [0, 10000];


  filters = {
    inStock: true,
    prescription: false,
    discount: ''
  };

  mostSearchedMedicines = ['Paracetamol', 'Dolo', 'Beta', 'Zifi', 'Thyrox', 'Ltk'];
  cartArray: any[] = [];
  dataSource: any[] = [];
  dataExistesinCart: boolean = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private medicineApi: EvitalApiService,
    private toster : ToastrService,
    private sharedDataService: ShareddataService

  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
    });
  }

  ngOnInit(): void {


  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
    }, 0);
  }

  onSearch(event: any): void {
    const searchTerm = event.target.value;
    this.searchQuery = searchTerm;
    this.searchSubject.next(searchTerm);
    console.log('Search query:', searchTerm);

    if (searchTerm.length > 2) {
       this.selectedMedicine = searchTerm;
      this.getMedicinelists(searchTerm);
    }
  }


  getMedicinelists(medicinename:any): void {
    this.medicineApi.getMedicinelist(medicinename).subscribe({
  next: (res) => {
    const data = res.data;
    const Suggestions = data.did_you_mean_result;
if(Suggestions.length > 0){
this.suggestions = Suggestions[0].medicine_name;
this.dataSource = [];
}else{
    this.dataSource = res.data.result;

}
  },
  error: (err) => {
  }
});

  }


  buttonSearch(medicine: any): void {
    this.searchQuery = medicine;
    this.selectedMedicine = medicine;
    this.getMedicinelists(medicine);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedMedicine = '';
    this.dataSource = [];
    this.suggestions = null;
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }


  openDialog(medicine: any): void {
    this.dialog.open(ViewDetailsComponent, {
      width: '90%',
      maxWidth: '1000px',
      data: medicine,
      panelClass: 'custom-dialog-container',
      autoFocus: false,
      backdropClass: 'dark-backdrop'
    });
  }

  AddtoCart(medicine: any): void {

    const medicineIds = [medicine.medicine_id];
    const id = JSON.stringify(medicineIds);
    const availableForPatient = medicine.available_for_patient?.toLowerCase() === 'yes';

    const storedCartData = localStorage.getItem('cartCheckoutResponse');
    if (storedCartData) {
      this.cartArray = JSON.parse(storedCartData);
    }

    this.medicineApi.getMedicineInfo(id).subscribe({
      next: (res) => {
if(res.data.length === 0){

  this.toster.error('No data for available');
return
}
        if (Array.isArray(this.cartArray)) {
           this.dataExistesinCart = this.cartArray.some((item) =>
            item.data[0]?.id === res.data[0]?.id
          );
        } else {
          this.cartArray = [];
          }

        if (!this.dataExistesinCart) {
          this.cartArray.push({ ...res, quantity: 1 });
        }
        if (availableForPatient  && !this.dataExistesinCart) {
          this.toster.success('Added to cart');
          this.sharedDataService.updateCartData(this.cartArray);
        } else if(!availableForPatient){
          this.cartArray = this.cartArray.filter((item) => item.data[0]?.id !== res.id);
          this.toster.error('Not available for patient');
        }else {
          this.toster.info('Already in cart');
        }
      },
      error: (err) => {
        this.toster.error('Failed to add to cart. Please try again.');
      },
    });

  }
}
