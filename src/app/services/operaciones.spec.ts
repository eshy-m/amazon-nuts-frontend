import { TestBed } from '@angular/core/testing';

import { Operaciones } from './operaciones';

describe('Operaciones', () => {
  let service: Operaciones;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Operaciones);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
