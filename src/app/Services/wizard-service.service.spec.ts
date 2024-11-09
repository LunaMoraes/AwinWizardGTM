import { TestBed } from '@angular/core/testing';

import { WizardServiceService } from './wizard-service.service';

describe('WizardServiceService', () => {
  let service: WizardServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WizardServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
