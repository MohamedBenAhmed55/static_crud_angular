import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EmployeeService } from './services/employee.service';

import { z } from 'zod';

const employeeSchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  dob: z.string().nonempty(),
  age: z.number().min(0),
  salary: z.string().nonempty(),
  contactNumber: z.string().nonempty(),
  email: z.string().email(),
  address: z.string().nonempty(),
});


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
    HttpClientModule,
    ReactiveFormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [EmployeeService]
})

export class AppComponent implements OnInit {
  employeeForm: FormGroup;
  submitted: boolean = false;

  constructor(private employeeService: EmployeeService, private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dob: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      salary: ['', Validators.required],
      contactNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchEmployees();
  }

  // Fetching
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
  sortColumn: keyof Employee | 'index' = 'firstName';
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

  filteredEmployees: Employee[] = [...this.employees];

  onSubmit() {
    this.submitted = true;

    if (this.employeeForm.valid) {
      try {
        const newEmployee: Employee = {
          id: null,
          imageUrl: null,
          ...employeeSchema.parse(this.employeeForm.value),
        };
        this.employees.push(newEmployee);
        this.employeeForm.reset();
        this.submitted = false;
        alert("Employee successfully added!");
        this.applyFilter();
        this.sortData(this.sortColumn);
      } catch (error) {
        alert("Operation Failed");
      }
    }
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
    const start: number = (this.currentPage - 1) * this.pageSize;
    const end: number = start + Number(this.pageSize);
    return this.filteredEmployees.slice(start, end);
  }

  totalPages() {
    return Math.ceil(this.filteredEmployees.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
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

      return nameMatch && ageMatch && dobMatch && salaryMatch && contactNumberMatch && emailMatch && addressMatch;
    });

    this.currentPage = 1;
    this.updatePagination();
  }
}
