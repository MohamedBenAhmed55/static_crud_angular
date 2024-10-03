import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngFor
import { HttpClientModule } from '@angular/common/http';
import { EmployeeService } from './services/employee.service';

interface Employee {
  id: number | string | null;
  age: number | string | null;
  dob: string | null;
  email: string | null;
  salary: number | string | null;
  address: string | null;
  imageUrl: string | null;
  lastName: string | null;
  firstName: string | null;
  contactNumber: string | number | null;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    FormsModule,   
    CommonModule,
    HttpClientModule 
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [EmployeeService]
})

export class AppComponent implements OnInit {

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.employeeService.getEmployees().subscribe((data: Employee[]) => {
      this.employees = data;
      this.filteredEmployees = [...this.employees]; 
    });
  }

  employees: Employee[] = [];
  
  newEmployee: Employee = { 
    id: null, 
    age: null, 
    dob: null, 
    email: null, 
    salary: null, 
    address: null, 
    imageUrl: null, 
    lastName: null, 
    firstName: null, 
    contactNumber: null 
  };

  isEditMode: boolean = false;
  currentIndex: number | null = null;
  sortColumn: keyof Employee | 'index' = 'email';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination variables
  pageSize: number = 10; 
  currentPage: number = 1;

  // Filter variable
  filterText: string = ''; 

  filters: any = {
    name: '',
    age: '',
    dob: '',
    salary: '',
    contactNumber: '',
    email: '',
    address: ''
  };

  filteredEmployees: Employee[] = [...this.employees]; // Filtered list of employees

  onSubmit() {
    if (this.isEditMode && this.currentIndex !== null) {
      this.employees[this.currentIndex] = { ...this.newEmployee };
      this.isEditMode = false;
      this.currentIndex = null;
    } else {
      this.employees.push({ ...this.newEmployee });
    }
    // Reset the form after submission
    this.newEmployee = {
      id: null,
      age: null,
      dob: null,
      email: null,
      salary: null,
      address: null,
      imageUrl: null,
      lastName: null,
      firstName: null,
      contactNumber: null
    };
    this.applyFilter(); 
    this.sortData(this.sortColumn); 
    this.closeModal();
  }

  deleteEmployee(index: number) {
    const realIndex = this.employees.indexOf(this.filteredEmployees[index]);
    this.employees.splice(realIndex, 1);
    this.applyFilter(); 
  }

  sortData(column: keyof Employee | 'index') {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortDirection = 'asc';
    }

    this.sortColumn = column;

    this.filteredEmployees.sort((a: Employee, b: Employee) => {
      let valueA, valueB;

      if (column === 'index') {
        valueA = this.filteredEmployees.indexOf(a);
        valueB = this.filteredEmployees.indexOf(b);
      } else {
        valueA = a[column];
        valueB = b[column];
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return this.sortDirection === 'asc' ? (valueA as number) - (valueB as number) : (valueB as number) - (valueA as number);
      }
    });
  }

  getSortIcon(column: keyof Employee | 'index'): string {
    if (this.sortColumn !== column) {
      return '';
    }
    return this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc';
  }

  // Pagination logic
  paginatedEmployees() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredEmployees.slice(start, end);
  }

  totalPages() {
    return Math.ceil(this.filteredEmployees.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onPageSizeChange() {
    this.currentPage = 1; 
    this.updatePagination();
  }

  updatePagination() {
    if (this.currentPage > this.totalPages()) {
      this.currentPage = this.totalPages();
    }
  }

  // Filter logic
  applyFilter() {
    this.filteredEmployees = this.employees.filter(employee => {
      const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase();
      const nameMatch = fullName.includes(this.filters.name.toLowerCase());
      const ageMatch = employee.age?.toString().includes(this.filters.age);
      const dobMatch = employee.dob?.toLowerCase().includes(this.filters.dob.toLowerCase());
      const salaryMatch = employee.salary?.toString().includes(this.filters.salary);
      const contactNumberMatch = employee.contactNumber?.toString().includes(this.filters.contactNumber);
      const emailMatch = employee.email?.toLowerCase().includes(this.filters.email.toLowerCase());
      const addressMatch = employee.address?.toLowerCase().includes(this.filters.address.toLowerCase());

      // Filter based on all column matches
      return nameMatch && ageMatch && dobMatch && salaryMatch && contactNumberMatch && emailMatch && addressMatch;
    });

    this.currentPage = 1; 
    this.updatePagination();
  }

  isModalOpen = false;

  // Open modal
  openModal() {
    this.isModalOpen = true;
  }

  // Close modal
  closeModal() {
    this.isModalOpen = false;
  }
}
