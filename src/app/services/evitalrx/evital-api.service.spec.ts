import { TestBed } from '@angular/core/testing';

import { EvitalApiService } from './evital-api.service';

describe('EvitalApiService', () => {
  let service: EvitalApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvitalApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
