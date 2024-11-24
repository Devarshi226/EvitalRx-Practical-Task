import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

interface Medicine {
  id: number;
  medicine_name: string;
  manufacturer_name: string;
  packing_size: string;
  price: number;
  available_for_patient: string;
  description?: string;
  image?: string;
}

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

  // Filters
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

  // Popular medicines
  mostSearchedMedicines: string[] = [
    'Dolo 650',
    'Crocin',
    'Vitamin D3',
    'Paracetamol',
    'B Complex',
    'Azithromycin'
  ];

  // Results
  dataSource: Medicine[] = [];
  private originalDataSource: Medicine[] = [];

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  ngOnInit(): void {
    // Initialize with sample data
    this.originalDataSource = [
      {
        id: 1,
        medicine_name: 'Dolo 650',
        manufacturer_name: 'Micro Labs Ltd',
        packing_size: '15 Tablets',
        price: 30.90,
        available_for_patient: 'Yes',
        description: 'Paracetamol 650mg tablet',
        image: 'assets/medicines/dolo.jpg'
      },
      // Add more sample medicines
    ];
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
  }

  private performSearch(searchTerm: string): void {
    this.isLoading = true;
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
      this.dataSource = [];
      this.suggestions = null;
      this.isLoading = false;
      return;
    }

    // Simulate API call
    setTimeout(() => {
      if (term === 'dol') {
        this.suggestions = 'Dolo';
        this.dataSource = [];
      } else {
        this.dataSource = this.originalDataSource.filter(medicine =>
          medicine.medicine_name.toLowerCase().includes(term) ||
          medicine.manufacturer_name.toLowerCase().includes(term)
        );
        this.suggestions = null;
      }
      this.isLoading = false;
    }, 500);
  }

  buttonSearch(medicine: string): void {
    this.searchQuery = medicine;
    this.selectedMedicine = medicine;
    this.performSearch(medicine);
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

  toggleCategory(event: any): void {
    if (event.source.selected) {
      this.selectedCategories = event.source.value;
    }
    this.applyFilters();
  }

  onSortChange(): void {
    this.sortMedicines();
  }

  private sortMedicines(): void {
    switch (this.sortOption) {
      case 'priceAsc':
        this.dataSource.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        this.dataSource.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        this.dataSource.sort((a, b) =>
          a.medicine_name.localeCompare(b.medicine_name));
        break;
    }
  }

  resetFilters(): void {
    this.filters = {
      inStock: true,
      prescription: false,
      discount: ''
    };
    this.priceRange = [0, 10000];
    this.selectedCategories = [];
    this.applyFilters();
  }

  applyFilters(): void {
    let filteredData = [...this.originalDataSource];

    // Apply category filter
    if (this.selectedCategories.length > 0 &&
        !this.selectedCategories.includes('All Medicines')) {
      // Implement category filtering logic
    }

    // Apply price range
    filteredData = filteredData.filter(medicine =>
      medicine.price >= this.priceRange[0] &&
      medicine.price <= this.priceRange[1]
    );

    // Apply availability filter
    if (this.filters.inStock) {
      filteredData = filteredData.filter(medicine =>
        medicine.available_for_patient === 'Yes'
      );
    }

    this.dataSource = filteredData;
    this.sortMedicines();
    this.filterDrawer?.close();
  }

  openDialog(medicine: Medicine): void {
    // Implement dialog logic to show medicine details
    console.log('Opening dialog for:', medicine);
  }

  AddtoCart(medicine: Medicine): void {
    // Implement add to cart logic
    console.log('Adding to cart:', medicine);
  }
}
