import { TestBed } from '@angular/core/testing';

import { DevService } from './dev.service';

describe('DevService', () => {
  let service: DevService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DevService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
