import { TestBed } from '@angular/core/testing';

import { TokenceptorService } from './tokenceptor.service';

describe('TokenceptorService', () => {
  let service: TokenceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
