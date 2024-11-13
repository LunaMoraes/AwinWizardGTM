import { TestBed } from '@angular/core/testing';

import { GAPIService } from './gapi.service';

describe('GAPIService', () => {
  let service: GAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
