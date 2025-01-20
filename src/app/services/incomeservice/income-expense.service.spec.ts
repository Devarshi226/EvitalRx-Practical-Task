import { TestBed } from '@angular/core/testing';

import { IncomeExpenseService } from './income-expense.service';

describe('IncomeExpenseService', () => {
  let service: IncomeExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncomeExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
